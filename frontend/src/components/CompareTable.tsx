import { Link } from "react-router-dom";
import { DEV_COLORS } from "../lib/colors";
import type { CompareResult } from "../lib/types";

export default function CompareTable({ data }: { data: CompareResult }) {
  const { developers, metrics } = data;

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="sticky left-0 bg-slate-900 px-4 py-3 text-left font-medium text-slate-400">
              Metric
            </th>
            {developers.map((d, i) => (
              <th key={d.username} className="px-4 py-3 text-left">
                <Link to={`/dev/${d.username}`} className="flex items-center gap-2 hover:underline">
                  <img src={d.avatarUrl} alt="" className="h-7 w-7 rounded-full" />
                  <span className="font-semibold" style={{ color: DEV_COLORS[i % DEV_COLORS.length] }}>
                    {d.username}
                  </span>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m) => (
            <tr key={m.key} className="border-b border-slate-800/60">
              <td className="sticky left-0 bg-slate-900 px-4 py-3 text-slate-400">{m.label}</td>
              {developers.map((d) => {
                const isLeader = m.leader === d.username;
                return (
                  <td
                    key={d.username}
                    className={`px-4 py-3 tabular-nums ${isLeader ? "font-bold text-emerald-300" : ""}`}
                  >
                    {m.values[d.username].toLocaleString()}
                    {isLeader && <span className="ml-1" title="Leader">★</span>}
                  </td>
                );
              })}
            </tr>
          ))}
          <tr>
            <td className="sticky left-0 bg-slate-900 px-4 py-3 text-slate-400">Top language</td>
            {developers.map((d) => (
              <td key={d.username} className="px-4 py-3">
                {d.languages[0]?.name ?? "—"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}