import type { LanguageShare } from "../lib/types";

const COLORS = [
  "#6366f1", "#22c55e", "#f59e0b", "#ef4444",
  "#06b6d4", "#ec4899", "#a855f7", "#84cc16",
];

export default function LanguageBar({ languages }: { languages: LanguageShare[] }) {
  if (languages.length === 0) {
    return <p className="text-sm text-slate-400">No language data available.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">
        {languages.map((l, i) => (
          <div
            key={l.name}
            title={`${l.name} ${l.percent}%`}
            style={{ width: `${l.percent}%`, backgroundColor: COLORS[i % COLORS.length] }}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
        {languages.map((l, i) => (
          <li key={l.name} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <span>{l.name}</span>
            <span className="text-slate-400">{l.percent}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}