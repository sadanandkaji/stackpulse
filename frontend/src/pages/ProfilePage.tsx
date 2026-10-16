import { useParams } from "react-router-dom";
import CommitChart from "../components/CommitChart";
import LanguageBar from "../components/LanguageBar";
import RepoList from "../components/RepoList";
import SearchBar from "../components/SearchBar";
import StatCard from "../components/StatCard";
import { useDeveloper, useRefreshDeveloper } from "../hooks/useDeveloper";
import { ApiError } from "../lib/api";

export default function ProfilePage() {
  const { username = "" } = useParams();
  const { data, isLoading, error } = useDeveloper(username);
  const refresh = useRefreshDeveloper(username);

  return (
    <div className="space-y-6">
      <SearchBar key={username} initial={username} />

      {isLoading && (
        <p className="py-12 text-center text-slate-400">
          Loading {username}... the first lookup can take a few seconds.
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error instanceof ApiError ? error.message : "Could not reach the server"}
        </p>
      )}

      {data && (
        <>
          {data.developer.stale && (
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              GitHub rate limit reached. Showing cached data from{" "}
              {new Date(data.developer.fetchedAt).toLocaleString()}.
            </p>
          )}

          <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={data.developer.avatarUrl}
              alt={data.developer.username}
              className="h-20 w-20 rounded-full border border-slate-700"
            />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-bold">
                {data.developer.name ?? data.developer.username}
              </h1>
              <p className="text-slate-400">@{data.developer.username}</p>
              {data.developer.bio && <p className="mt-1 text-sm text-slate-300">{data.developer.bio}</p>}
            </div>
            <button
              onClick={() => refresh.mutate()}
              disabled={refresh.isPending}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800 disabled:opacity-60"
            >
              {refresh.isPending ? "Refreshing..." : "Refresh data"}
            </button>
          </section>

          <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Total stars" value={data.developer.totalStars} />
            <StatCard label="Followers" value={data.developer.followers} />
            <StatCard label="Public repos" value={data.developer.publicRepos} />
            <StatCard label="Commits (12 mo)" value={data.developer.totalCommits} />
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="font-semibold">Top languages</h2>
              <LanguageBar languages={data.developer.languages} />
            </div>
            <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
              <h2 className="font-semibold">Commit activity</h2>
              <CommitChart data={data.developer.commitActivity} />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Repositories ({data.repos.length})</h2>
            <RepoList repos={data.repos} />
          </section>
        </>
      )}
    </div>
  );
}