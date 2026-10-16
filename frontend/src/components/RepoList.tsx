import { useState } from "react";
import { useCreatePin, useDeletePin, usePins } from "../hooks/usePins";
import type { RepoItem } from "../lib/types";

const PAGE = 20;

export default function RepoList({ repos }: { repos: RepoItem[] }) {
  const [visible, setVisible] = useState(PAGE);
  const { data } = usePins();
  const createPin = useCreatePin();
  const deletePin = useDeletePin();

  // repoId -> pinId
  const pinned = new Map((data?.pins ?? []).map((p) => [p.repo.id, p.id]));
  const busy = createPin.isPending || deletePin.isPending;

  function toggle(repoId: number) {
    const pinId = pinned.get(repoId);
    if (pinId) deletePin.mutate(pinId);
    else createPin.mutate({ repoId });
  }

  if (repos.length === 0) {
    return <p className="text-sm text-slate-400">No public repositories.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {repos.slice(0, visible).map((r) => {
          const isPinned = pinned.has(r.id);
          return (
            <div
              key={r.id}
              className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900 p-4 transition hover:border-indigo-500/60"
            >
              <div className="flex items-start justify-between gap-2">
                <a
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all font-semibold text-indigo-300 hover:underline"
                >
                  {r.name}
                </a>
                <div className="flex shrink-0 items-center gap-2">
                  {r.isFork && (
                    <span className="rounded-full border border-slate-700 px-2 py-0.5 text-xs text-slate-400">
                      fork
                    </span>
                  )}
                  <button
                    onClick={() => toggle(r.id)}
                    disabled={busy}
                    className={`rounded-lg border px-2.5 py-1 text-xs font-medium disabled:opacity-60 ${
                      isPinned
                        ? "border-indigo-500 bg-indigo-500/20 text-indigo-200"
                        : "border-slate-700 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {isPinned ? "Pinned" : "Pin"}
                  </button>
                </div>
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
            </div>
          );
        })}
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