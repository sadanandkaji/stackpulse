import { env } from "../config/env";
import { HttpError } from "../lib/httpError";

const BASE = "https://api.github.com";
const MAX_REPO_PAGES = 2; // up to 200 repos per developer

export interface GhUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  followers: number;
  public_repos: number;
}

export interface GhRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  pushed_at: string | null;
  fork: boolean;
}

interface GhCommit {
  commit: { author: { date: string } | null };
}

export class RateLimitError extends Error {}

/** Returns null for 404 (missing) and 409 (empty repo). Throws RateLimitError when limited. */
async function ghFetch<T>(path: string): Promise<T | null> {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "stackpulse",
      ...(env.GITHUB_TOKEN ? { Authorization: `Bearer ${env.GITHUB_TOKEN}` } : {}),
    },
  });

  if (res.status === 404 || res.status === 409) return null;

  if (res.status === 429 || (res.status === 403 && res.headers.get("x-ratelimit-remaining") === "0")) {
    throw new RateLimitError("GitHub rate limit reached");
  }
  if (!res.ok) throw new HttpError(502, `GitHub request failed (${res.status})`);

  return (await res.json()) as T;
}

export async function fetchUser(username: string): Promise<GhUser> {
  const user = await ghFetch<GhUser>(`/users/${username}`);
  if (!user) throw new HttpError(404, `GitHub user "${username}" not found`);
  return user;
}

export async function fetchRepos(username: string): Promise<GhRepo[]> {
  const all: GhRepo[] = [];
  for (let page = 1; page <= MAX_REPO_PAGES; page++) {
    const batch = await ghFetch<GhRepo[]>(
      `/users/${username}/repos?per_page=100&page=${page}&sort=pushed&type=owner`
    );
    if (!batch) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

export async function fetchLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  return (await ghFetch<Record<string, number>>(`/repos/${owner}/${repo}/languages`)) ?? {};
}

/** Commit dates authored by `author` in this repo since `since` (first 100 commits). */
export async function fetchCommitDates(
  owner: string,
  repo: string,
  author: string,
  since: string
): Promise<string[]> {
  const commits = await ghFetch<GhCommit[]>(
    `/repos/${owner}/${repo}/commits?author=${author}&since=${since}&per_page=100`
  );
  return (commits ?? []).flatMap((c) => (c.commit.author?.date ? [c.commit.author.date] : []));
}