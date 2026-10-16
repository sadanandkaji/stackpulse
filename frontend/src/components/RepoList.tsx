import { useState } from "react";
import type { RepoItem } from "../lib/types";

const PAGE = 20;

export default function RepoList({ repos }: { repos: RepoItem[] }) {
  const [visible, setVisible] = useState(PAGE);

  if (repos.length === 0) {
    return <p className="text-sm text-slate-400">No public repositories.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {repos.slice(0, visible).map((r) => (
          <a
            key={r.id}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-indigo-500/60"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="break-all font-semibold text-indigo-300">{r.name}</span>
              {r.isFork && (
                <span className="shrink-0 rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-400">
                  fork
                </span>
              )}
            </div>
            <p className="line-clamp-2 min-h-[2.5rem] text-sm text-slate-400">
              {r.description ?? "No description"}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>★ {r.stars.toLocaleString()}</span>
              <span>⑂ {r.forks.toLocaleString()}</span>
              {r.primaryLanguage && <span>{r.primaryLanguage}</span>}
              {r.pushedAt && <span>Updated {new Date(r.pushedAt).toLocaleDateString()}</span>}
            </div>
          </a>
        ))}
      </div>
      {visible < repos.length && (
        <button
          onClick={() => setVisible((v) => v + PAGE)}
          className="w-full rounded-lg border border-slate-700 py-2 text-sm hover:bg-slate-800 sm:w-auto sm:px-6"
        >
          Show more ({repos.length - visible} left)
        </button>
      )}
    </div>
  );
}