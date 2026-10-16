import { HttpError } from "../lib/httpError";
import { mapLimit } from "../lib/mapLimit";
import { getDeveloper } from "./developer.service";

type Summary = Awaited<ReturnType<typeof getDeveloper>>["developer"];

const MIN_DEVS = 2;
const MAX_DEVS = 5;

const METRICS: { key: string; label: string; get: (d: Summary) => number }[] = [
  { key: "totalStars", label: "Total stars", get: (d) => d.totalStars },
  { key: "followers", label: "Followers", get: (d) => d.followers },
  { key: "publicRepos", label: "Public repos", get: (d) => d.publicRepos },
  { key: "totalCommits", label: "Commits (12 mo)", get: (d) => d.totalCommits },
  {
    key: "starsPerRepo",
    label: "Stars per repo",
    get: (d) => (d.publicRepos ? Math.round((d.totalStars / d.publicRepos) * 10) / 10 : 0),
  },
];

export async function compareDevelopers(rawUsers: string) {
  const usernames = [
    ...new Set(rawUsers.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean)),
  ];
  if (usernames.length < MIN_DEVS) throw new HttpError(400, `Provide at least ${MIN_DEVS} usernames`);
  if (usernames.length > MAX_DEVS) throw new HttpError(400, `Compare at most ${MAX_DEVS} developers`);

  // Developers load in parallel (capped); one failure doesn't sink the rest
  const results = await mapLimit(usernames, 3, async (username) => {
    try {
      return { username, developer: (await getDeveloper(username)).developer };
    } catch (e) {
      return { username, error: e instanceof HttpError ? e.message : "Failed to load developer" };
    }
  });

  const developers: Summary[] = [];
  const errors: { username: string; message: string }[] = [];
  for (const r of results) {
    if ("developer" in r && r.developer) developers.push(r.developer);
    else if ("error" in r && r.error) errors.push({ username: r.username, message: r.error });
  }

  const metrics = METRICS.map((m) => {
    const values: Record<string, number> = {};
    for (const d of developers) values[d.username] = m.get(d);
    const max = Math.max(...Object.values(values), 0);
    const leaders = developers.filter((d) => values[d.username] === max).map((d) => d.username);
    return { key: m.key, label: m.label, values, leader: max > 0 && leaders.length === 1 ? leaders[0] : null };
  });

  // Union of each developer's top languages, ranked by combined share
  const langTotals = new Map<string, number>();
  for (const d of developers) {
    for (const l of d.languages) langTotals.set(l.name, (langTotals.get(l.name) ?? 0) + l.percent);
  }
  const languages = [...langTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name]) => {
      const values: Record<string, number> = {};
      for (const d of developers) values[d.username] = d.languages.find((l) => l.name === name)?.percent ?? 0;
      return { name, values };
    });

  const commitActivity = (developers[0]?.commitActivity ?? []).map(({ month }) => {
    const counts: Record<string, number> = {};
    for (const d of developers) counts[d.username] = d.commitActivity.find((c) => c.month === month)?.count ?? 0;
    return { month, counts };
  });

  return { developers, errors, metrics, languages, commitActivity };
}