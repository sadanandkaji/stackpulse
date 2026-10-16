import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDeletePin, usePins, useUpdatePin } from "../hooks/usePins";
import { ApiError } from "../lib/api";
import type { Pin } from "../lib/types";

function parseTags(text: string): string[] {
  return text
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
}

function PinCard({ pin }: { pin: Pin }) {
  const update = useUpdatePin();
  const remove = useDeletePin();
  const [note, setNote] = useState(pin.note ?? "");
  const [tags, setTags] = useState(pin.tags.join(", "));
  const [saved, setSaved] = useState(false);

  const dirty = note !== (pin.note ?? "") || tags !== pin.tags.join(", ");

  function save() {
    setSaved(false);
    update.mutate(
      { id: pin.id, note, tags: parseTags(tags) },
      { onSuccess: () => setSaved(true) }
    );
  }

  const inputClass =
    "w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30";

  return (
    <li className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={pin.repo.url}
            target="_blank"
            rel="noreferrer"
            className="break-all font-semibold text-indigo-300 hover:underline"
          >
            {pin.repo.name}
          </a>
          <p className="mt-0.5 text-xs text-slate-400">
            by{" "}
            <Link to={`/dev/${pin.repo.owner}`} className="hover:underline">
              @{pin.repo.owner}
            </Link>
          </p>
        </div>
        <button
          onClick={() => remove.mutate(pin.id)}
          disabled={remove.isPending}
          className="shrink-0 rounded-lg border border-red-500/40 px-2.5 py-1 text-xs text-red-300 hover:bg-red-500/10 disabled:opacity-60"
        >
          Unpin
        </button>
      </div>

      {pin.repo.description && <p className="text-sm text-slate-400">{pin.repo.description}</p>}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
        <span>★ {pin.repo.stars.toLocaleString()}</span>
        {pin.repo.primaryLanguage && <span>{pin.repo.primaryLanguage}</span>}
        {pin.repo.pushedAt && <span>Updated {new Date(pin.repo.pushedAt).toLocaleDateString()}</span>}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        maxLength={1000}
        placeholder="Add a note..."
        className={inputClass}
      />
      <input
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        placeholder="Tags, comma separated (e.g. react, tooling)"
        className={inputClass}
      />

      <div className="flex items-center gap-3">
        <button
          onClick={save}
          disabled={!dirty || update.isPending}
          className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-50"
        >
          {update.isPending ? "Saving..." : "Save"}
        </button>
        {saved && !dirty && <span className="text-xs text-emerald-300">Saved</span>}
        {update.error && (
          <span className="text-xs text-red-300">
            {update.error instanceof ApiError
              ? update.error.details?.map((d) => d.message).join(". ") ?? update.error.message
              : "Could not save"}
          </span>
        )}
      </div>
    </li>
  );
}

export default function PinsPage() {
  const { data, isLoading, error } = usePins();
  const [tag, setTag] = useState<string | null>(null);

  const allTags = useMemo(
    () => [...new Set((data?.pins ?? []).flatMap((p) => p.tags))].sort(),
    [data]
  );
  const pins = (data?.pins ?? []).filter((p) => !tag || p.tags.includes(tag));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Pinned repositories</h1>
        <p className="text-sm text-slate-400">Your private notes and tags on repos you want to revisit.</p>
      </div>

      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setTag(null)}
            className={`rounded-full border px-3 py-1 text-xs ${
              tag === null ? "border-indigo-500 bg-indigo-500/20 text-indigo-200" : "border-slate-700 text-slate-300"
            }`}
          >
            All
          </button>
          {allTags.map((t) => (
            <button
              key={t}
              onClick={() => setTag(t === tag ? null : t)}
              className={`rounded-full border px-3 py-1 text-xs ${
                tag === t ? "border-indigo-500 bg-indigo-500/20 text-indigo-200" : "border-slate-700 text-slate-300"
              }`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {isLoading && <p className="py-12 text-center text-slate-400">Loading pins...</p>}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300">
          {error instanceof ApiError ? error.message : "Could not reach the server"}
        </p>
      )}

      {data && pins.length === 0 && (
        <p className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-6 text-center text-slate-400">
          {tag ? `No pins tagged #${tag}.` : "No pins yet. Open a developer and pin a repository."}
        </p>
      )}

      {pins.length > 0 && (
        <ul className="grid gap-3 lg:grid-cols-2">
          {pins.map((p) => (
            <PinCard key={p.id} pin={p} />
          ))}
        </ul>
      )}
    </div>
  );
}