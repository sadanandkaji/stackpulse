import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useComparisons,
  useDeleteComparison,
  useUpdateComparison,
} from "../hooks/useComparisons";
import { ApiError } from "../lib/api";
import type { SavedComparison } from "../lib/types";

function ComparisonCard({ c }: { c: SavedComparison }) {
  const update = useUpdateComparison();
  const remove = useDeleteComparison();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(c.name);

  function rename() {
    update.mutate({ id: c.id, name }, { onSuccess: () => setEditing(false) });
  }

  function onDelete() {
    if (window.confirm(`Delete "${c.name}"?`)) remove.mutate(c.id);
  }

  return (
    <li className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
      {editing ? (
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-indigo-500"
          />
          <button
            onClick={rename}
            disabled={!name.trim() || update.isPending}
            className="rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            Save
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setName(c.name);
            }}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      ) : (
        <h2 className="break-words text-lg font-semibold">{c.name}</h2>
      )}

      {update.error && (
        <p className="text-xs text-red-300">
          {update.error instanceof ApiError ? update.error.message : "Could not save"}
        </p>
      )}

      <ul className="flex flex-wrap gap-2">
        {c.usernames.map((u) => (
          <li key={u} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300">
            {u}
          </li>
        ))}
      </ul>

      <p className="text-xs text-slate-500">Saved {new Date(c.createdAt).toLocaleDateString()}</p>

      <div className="flex flex-wrap gap-2">
        <Link
          to={`/compare?users=${encodeURIComponent(c.usernames.join(","))}&saved=${c.id}`}
          className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-400"
        >
          Open
        </Link>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm hover:bg-slate-800"
          >
            Rename
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={remove.isPending}
          className="rounded-lg border border-red-500/40 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10 disabled:opacity-60"
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export default function SavedComparisonsPage() {
  const { data, isLoading, error } = useComparisons();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Saved comparisons</h1>
        <p className="text-sm text-slate-400">Reopen any comparison with fresh data.</p>
      </div>

      {isLoading && <p className="py-12 text-center text-slate-400">Loading...</p>}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error instanceof ApiError ? error.message : "Could not reach the server"}
        </p>
      )}

      {data && data.comparisons.length === 0 && (
        <p className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-6 text-center text-slate-400">
          Nothing saved yet.{" "}
          <Link to="/compare" className="text-indigo-400 hover:underline">
            Start a comparison
          </Link>
          .
        </p>
      )}

      {data && data.comparisons.length > 0 && (
        <ul className="grid gap-3 md:grid-cols-2">
          {data.comparisons.map((c) => (
            <ComparisonCard key={c.id} c={c} />
          ))}
        </ul>
      )}
    </div>
  );
}