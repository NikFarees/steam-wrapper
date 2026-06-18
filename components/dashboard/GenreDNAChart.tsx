// components/dashboard/GenreDNAChart.tsx

"use client";

import {
  RadarChart, PolarGrid, PolarAngleAxis,
  Radar, ResponsiveContainer, Tooltip,
} from "recharts";
import type { GenreData } from "@/lib/types";

interface Props { data: GenreData[] }

export default function GenreDNAChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="glass p-6 flex items-center justify-center">
        <p className="text-sm text-slate-500">No playtime data available.</p>
      </div>
    );
  }

  return (
    <div className="glass p-6 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-100">Genre DNA</h2>
      <p className="text-xs text-slate-500">Playtime distribution by genre (hours)</p>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <defs>
              <linearGradient id="genreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#66c0f4" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#3d8fc6" stopOpacity={0.2} />
              </linearGradient>
            </defs>
            <PolarGrid stroke="rgba(255,255,255,0.08)" />
            <PolarAngleAxis dataKey="genre" tick={{ fill: "#94a3b8", fontSize: 11 }} />
            <Radar
              name="Playtime"
              dataKey="playtimeHours"
              stroke="#66c0f4"
              strokeWidth={2}
              fill="url(#genreGradient)"
              dot={{ fill: "#66c0f4", r: 3 }}
            />
            <Tooltip
              contentStyle={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#cbd5e1", fontSize: 12 }}
              formatter={(v) => [`${v ?? 0}h`, "Playtime"]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.slice(0, 4).map((item) => (
          <div key={item.genre} className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="inline-block h-2 w-2 rounded-full bg-[#66c0f4]" />
            {item.genre}: {item.playtimeHours}h
          </div>
        ))}
      </div>
    </div>
  );
}
