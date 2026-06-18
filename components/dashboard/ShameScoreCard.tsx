// components/dashboard/ShameScoreCard.tsx

"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import type { ShameScoreData } from "@/lib/types";

interface Props { data: ShameScoreData }

function shameLabel(score: number): string {
  if (score >= 80) return "Hoarder 😱";
  if (score >= 50) return "Backlogger 😅";
  if (score >= 25) return "Casual Collector 🎮";
  return "True Gamer ✅";
}

export default function ShameScoreCard({ data }: Props) {
  const chartData = [
    { value: data.shameScore, fill: "#ef4444" },
    { value: 100 - data.shameScore, fill: "#1e293b" },
  ];

  return (
    <div className="glass p-6 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-100">Shame Score</h2>

      <div className="relative h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="60%" outerRadius="90%"
            startAngle={90} endAngle={-270}
            data={chartData} barSize={16}
          >
            <RadialBar dataKey="value" cornerRadius={8} background={false} isAnimationActive />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-red-400">{data.shameScore}%</span>
          <span className="text-xs text-slate-400 mt-1">unplayed</span>
        </div>
      </div>

      <p className="text-center text-sm font-medium text-slate-300">{shameLabel(data.shameScore)}</p>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: data.total, color: "text-slate-100" },
          { label: "Played", value: data.played, color: "text-green-400" },
          { label: "Unplayed", value: data.unplayed, color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-white/5 p-3 text-center">
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {data.topUnplayed.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">Top unplayed</p>
          <ul className="space-y-1">
            {data.topUnplayed.slice(0, 3).map((game) => (
              <li key={game.appid} className="text-xs text-slate-400 truncate">{game.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
