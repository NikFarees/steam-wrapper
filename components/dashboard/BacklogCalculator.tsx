// components/dashboard/BacklogCalculator.tsx

"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import type { BacklogData } from "@/lib/types";

interface Props { data: BacklogData }

const COLORS = ["#66c0f4","#4fa8e0","#3d8fc6","#6ee7b7","#34d399","#a78bfa","#f87171","#fb923c"];

export default function BacklogCalculator({ data }: Props) {
  return (
    <div className="glass p-6 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-100">Backlog Calculator</h2>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-[#66c0f4]">{data.totalHours.toLocaleString()}h</p>
          <p className="text-xs text-slate-400 mt-1">Total hours</p>
        </div>
        <div className="rounded-xl bg-white/5 p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{data.totalDays}d</p>
          <p className="text-xs text-slate-400 mt-1">at 8h/day</p>
        </div>
      </div>

      <p className="text-xs text-slate-500">
        {data.items.length} unplayed game{data.items.length !== 1 ? "s" : ""} in backlog
      </p>

      {data.byGenre.length > 0 && (
        <>
          <p className="text-xs text-slate-400 font-medium">Hours by genre</p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byGenre} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="genre" tick={{ fill: "#94a3b8", fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#cbd5e1", fontSize: 12 }}
                  formatter={(v) => [`${v ?? 0}h`, "Hours"]}
                />
                <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                  {data.byGenre.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
