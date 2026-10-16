import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useComparisons, useCreateComparison, useUpdateComparison } from "../hooks/useComparisons";
import { ApiError } from "../lib/api";

function errorText(e: unknown) {
  if (e instanceof ApiError) return e.details?.map((d) => d.message).join(". ") ?? e.message;
  return "Could not reach the server";
}

export default function SaveComparison({
  usernames,
  savedId,
}: {
  usernames: string[];
  savedId: string | null;
}) {
  const [, setParams] = useSearchParams();
  const { data } = useComparisons();
  const create = useCreateComparison();
  const update = useUpdateComparison();
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const saved = savedId ? data?.comparisons.find((c) => c.id === Number(savedId)) : undefined;

  function onCreate() {
    setMessage(null);
    create.mutate(
      { name, usernames },
      {
        onSuccess: ({ comparison }) => {
          setName("");
          setMessage("Comparison saved");
          setParams({ users: usernames.join(","), saved: String(comparison.id) });
        },
      }
    );
  }

  function onUpdate() {
    if (!saved) return;
    setMessage(null);
    update.mutate(
      { id: saved.id, usernames },
      { onSuccess: () => setMessage("Saved comparison updated") }
    );
  }

  const error = create.error ?? update.error;

  return (
    <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h2 className="font-semibold">Save this comparison</h2>

      {saved && (
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="text-slate-300">
            Editing saved comparison: <span className="font-semibold">{saved.name}</span>
          </span>
          <button
            onClick={onUpdate}
            disabled={update.isPending}
            className="rounded-lg border border-slate-700 px-3 py-1.5 hover:bg-slate-800 disabled:opacity-60"
          >
            {update.isPending ? "Updating..." : "Update with current developers"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          placeholder={saved ? "Name for a new copy" : "Name, e.g. React core team"}
          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-base text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
        />
        <button
          onClick={onCreate}
          disabled={!name.trim() || create.isPending}
          className="rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {create.isPending ? "Saving..." : saved ? "Save as new" : "Save"}
        </button>
      </div>

      {message && <p className="text-sm text-emerald-300">{message}</p>}
      {error && <p className="text-sm text-red-300">{errorText(error)}</p>}
    </div>
  );
}