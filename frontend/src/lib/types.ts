export interface LanguageShare {
  name: string;
  bytes: number;
  percent: number;
}

export interface MonthCount {
  month: string;
  count: number;
}

export interface DeveloperSummary {
  id: number;
  username: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  followers: number;
  publicRepos: number;
  totalStars: number;
  totalCommits: number;
  languages: LanguageShare[];
  commitActivity: MonthCount[];
  fetchedAt: string;
  stale: boolean;
}

export interface RepoItem {
  id: number;
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  primaryLanguage: string | null;
  pushedAt: string | null;
  isFork: boolean;
}

export interface DeveloperProfile {
  developer: DeveloperSummary;
  repos: RepoItem[];
}
export interface CompareMetric {
  key: string;
  label: string;
  values: Record<string, number>;
  leader: string | null;
}

export interface CompareLanguageRow {
  name: string;
  values: Record<string, number>;
}

export interface CompareCommitRow {
  month: string;
  counts: Record<string, number>;
}

export interface CompareResult {
  developers: DeveloperSummary[];
  errors: { username: string; message: string }[];
  metrics: CompareMetric[];
  languages: CompareLanguageRow[];
  commitActivity: CompareCommitRow[];
}
