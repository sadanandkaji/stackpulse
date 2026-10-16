import { type SyntheticEvent, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import CompareCharts from "../components/CompareCharts";
import CompareTable from "../components/CompareTable";
import SaveComparison from "../components/SaveComparison";
import { useCompare } from "../hooks/useCompare";
import { ApiError } from "../lib/api";
import { DEV_COLORS } from "../lib/colors";

const MAX = 5;

export default function ComparePage() {
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState("");
  const savedId = params.get("saved");

  const usernames = useMemo(
    () => [...new Set((params.get("users") ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean))],
    [params]
  );

  const { data, isLoading, error } = useCompare(usernames);

  function setUsers(list: string[]) {
    const next: Record<string, string> = {};
    if (list.length) next.users = list.join(",");
    if (savedId) next.saved = savedId;
    setParams(next);
  }

  function onAdd(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const name = input.trim().replace(/^@/, "").toLowerCase();
    if (name && !usernames.includes(name) && usernames.length < MAX) setUsers([...usernames, name]);
    setInput("");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Compare developers</h1>
        <p className="text-sm text-slate-400">Add 2 to {MAX} GitHub usernames to see them side by side.</p>

        <form onSubmit={onAdd} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a GitHub username"
            disabled={usernames.length >= MAX}
            className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2.5 text-base text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={usernames.length >= MAX}
            className="rounded-lg bg-indigo-500 px-4 py-2.5 font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
          >
            Add
          </button>
        </form>

        {usernames.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {usernames.map((u, i) => (
              <li
                key={u}
                className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 py-1 pl-3 pr-2 text-sm"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: DEV_COLORS[i % DEV_COLORS.length] }} />
                {u}
                <button
                  onClick={() => setUsers(usernames.filter((x) => x !== u))}
                  aria-label={`Remove ${u}`}
                  className="rounded-full px-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {usernames.length < 2 && (
        <p className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-6 text-center text-slate-400">
          Add at least two developers to start comparing.
        </p>
      )}

      {isLoading && (
        <p className="py-12 text-center text-slate-400">Loading comparison... new developers can take a few seconds.</p>
      )}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error instanceof ApiError ? error.message : "Could not reach the server"}
        </p>
      )}

      {data && (
        <>
          {data.errors.map((e) => (
            <p key={e.username} className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {e.username}: {e.message}
            </p>
          ))}

          {data.developers.length >= 2 ? (
            <>
              <CompareTable data={data} />
              <CompareCharts data={data} />
              <SaveComparison usernames={usernames} savedId={savedId} />
            </>
          ) : (
            <p className="text-center text-slate-400">Need at least two valid developers to compare.</p>
          )}
        </>
      )}
    </div>
  );
}