import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DEV_COLORS } from "../lib/colors";
import type { CompareResult } from "../lib/types";

const tooltipStyle = {
  contentStyle: { background: "#0f172a", border: "1px solid #334155", borderRadius: 8 },
  labelStyle: { color: "#e2e8f0" },
};

function monthLabel(month: string) {
  return new Date(`${month}-01T00:00:00Z`).toLocaleString("en", { month: "short", timeZone: "UTC" });
}

export default function CompareCharts({ data }: { data: CompareResult }) {
  const usernames = data.developers.map((d) => d.username);

  const languageData = data.languages.map((l) => ({ name: l.name, values: l.values }));
  const commitData = data.commitActivity.map((c) => ({ label: monthLabel(c.month), counts: c.counts }));

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold">Language share (%)</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={languageData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip cursor={{ fill: "#1e293b" }} {...tooltipStyle} />
              <Legend />
              {usernames.map((u, i) => (
                <Bar
                  key={u}
                  name={u}
                  dataKey={(row: (typeof languageData)[number]) => row.values[u] ?? 0}
                  fill={DEV_COLORS[i % DEV_COLORS.length]}
                  radius={[3, 3, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="font-semibold">Commit activity (last 12 months)</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={commitData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
              <Tooltip {...tooltipStyle} />
              <Legend />
              {usernames.map((u, i) => (
                <Line
                  key={u}
                  name={u}
                  type="monotone"
                  dataKey={(row: (typeof commitData)[number]) => row.counts[u] ?? 0}
                  stroke={DEV_COLORS[i % DEV_COLORS.length]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}