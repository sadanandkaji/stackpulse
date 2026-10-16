import { Prisma } from "../../generated/prisma/client";
import { HttpError } from "../lib/httpError";
import { mapLimit } from "../lib/mapLimit";
import { prisma } from "../lib/prisma";
import * as github from "./github.client";

const TTL_MS = 60 * 60 * 1000; // serve from DB for 1 hour
const REFRESH_COOLDOWN_MS = 60 * 1000; // manual refresh allowed once a minute
const LANGUAGE_REPOS = 8; // per-repo calls are bounded
const COMMIT_REPOS = 5;
const CONCURRENCY = 4;
const USERNAME_RE = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

// Simultaneous requests for the same user share one GitHub fetch
const inflight = new Map<string, Promise<number>>();

export async function getDeveloper(rawUsername: string, force = false) {
  const username = rawUsername.trim().toLowerCase();
  if (!USERNAME_RE.test(username)) throw new HttpError(400, "Invalid GitHub username");

  const cached = await prisma.developer.findUnique({ where: { githubUsername: username } });
  const age = cached ? Date.now() - cached.fetchedAt.getTime() : Infinity;
  const useCache = force ? age < REFRESH_COOLDOWN_MS : age < TTL_MS;

  if (cached && useCache) return buildResponse(cached.id, false);

  try {
    return buildResponse(await refresh(username), false);
  } catch (e) {
    if (e instanceof github.RateLimitError) {
      // Graceful degradation: serve stale data if we have any
      if (cached) return buildResponse(cached.id, true);
      throw new HttpError(429, "GitHub rate limit reached. Try again later.");
    }
    throw e;
  }
}

function refresh(username: string): Promise<number> {
  let promise = inflight.get(username);
  if (!promise) {
    promise = fetchAndStore(username).finally(() => inflight.delete(username));
    inflight.set(username, promise);
  }
  return promise;
}

function lastTwelveMonths(): string[] {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (11 - i), 1));
    return d.toISOString().slice(0, 7);
  });
}

async function fetchAndStore(username: string): Promise<number> {
  const user = await github.fetchUser(username);
  const repos = await github.fetchRepos(username);
  const owned = repos.filter((r) => !r.fork);

  // Languages: top repos by stars
  const byStars = [...owned].sort((a, b) => b.stargazers_count - a.stargazers_count);
  const langResults = await mapLimit(byStars.slice(0, LANGUAGE_REPOS), CONCURRENCY, (r) =>
    github.fetchLanguages(user.login, r.name)
  );
  const languageBreakdown: Record<string, number> = {};
  for (const langs of langResults) {
    for (const [lang, bytes] of Object.entries(langs)) {
      languageBreakdown[lang] = (languageBreakdown[lang] ?? 0) + bytes;
    }
  }

  // Commit activity: most recently pushed repos, last 12 months, by month
  const months = lastTwelveMonths();
  const since = `${months[0]}-01T00:00:00Z`;
  const recent = [...owned]
    .sort((a, b) => (b.pushed_at ?? "").localeCompare(a.pushed_at ?? ""))
    .slice(0, COMMIT_REPOS);
  const dateLists = await mapLimit(recent, CONCURRENCY, (r) =>
    github.fetchCommitDates(user.login, r.name, user.login, since)
  );
  const counts = new Map(months.map((m) => [m, 0]));
  for (const date of dateLists.flat()) {
    const key = date.slice(0, 7);
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const commitActivity = months.map((month) => ({ month, count: counts.get(month) ?? 0 }));

  const data = {
    name: user.name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    followers: user.followers,
    publicRepos: user.public_repos,
    totalStars: owned.reduce((sum, r) => sum + r.stargazers_count, 0),
    languageBreakdown: languageBreakdown as Prisma.InputJsonValue,
    commitActivity: commitActivity as Prisma.InputJsonValue,
    fetchedAt: new Date(),
  };

  const dev = await prisma.developer.upsert({
    where: { githubUsername: username },
    create: { githubUsername: username, ...data },
    update: data,
  });

  // Upsert (not delete + insert) so future pins keep pointing at the same repo rows
  await prisma.$transaction(
    repos.map((r) => {
      const repoData = {
        description: r.description,
        url: r.html_url,
        stars: r.stargazers_count,
        forks: r.forks_count,
        primaryLanguage: r.language,
        pushedAt: r.pushed_at ? new Date(r.pushed_at) : null,
        isFork: r.fork,
      };
      return prisma.repo.upsert({
        where: { developerId_name: { developerId: dev.id, name: r.name } },
        create: { developerId: dev.id, name: r.name, ...repoData },
        update: repoData,
      });
    })
  );

  return dev.id;
}

async function buildResponse(id: number, stale: boolean) {
  const dev = await prisma.developer.findUniqueOrThrow({
    where: { id },
    include: { repos: { orderBy: [{ stars: "desc" }, { name: "asc" }] } },
  });

  const breakdown = (dev.languageBreakdown ?? {}) as unknown as Record<string, number>;
  const totalBytes = Object.values(breakdown).reduce((a, b) => a + b, 0);
  const languages = Object.entries(breakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: totalBytes ? Math.round((bytes / totalBytes) * 1000) / 10 : 0,
    }));

  const commitActivity = (dev.commitActivity ?? []) as unknown as { month: string; count: number }[];

  return {
    developer: {
      id: dev.id,
      username: dev.githubUsername,
      name: dev.name,
      avatarUrl: dev.avatarUrl,
      bio: dev.bio,
      followers: dev.followers,
      publicRepos: dev.publicRepos,
      totalStars: dev.totalStars,
      totalCommits: commitActivity.reduce((sum, m) => sum + m.count, 0),
      languages,
      commitActivity,
      fetchedAt: dev.fetchedAt,
      stale,
    },
    repos: dev.repos.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      url: r.url,
      stars: r.stars,
      forks: r.forks,
      primaryLanguage: r.primaryLanguage,
      pushedAt: r.pushedAt,
      isFork: r.isFork,
    })),
  };
}