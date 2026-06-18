"use client";

import { RadialBarChart, RadialBar, ResponsiveContainer } from "recharts";
import { Trophy, Timer, Package, AlertTriangle, Gamepad2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { ShameScoreData } from "@/lib/types";

interface Props { data: ShameScoreData }

function shameInfo(score: number): { label: string; Icon: React.ElementType; color: string } {
  if (score >= 80) return { label: "Mostly unplayed", Icon: AlertTriangle, color: "text-red-400" };
  if (score >= 50) return { label: "Backlog building", Icon: Timer, color: "text-orange-400" };
  if (score >= 25) return { label: "Some collecting", Icon: Package, color: "text-yellow-400" };
  return { label: "All caught up", Icon: Trophy, color: "text-emerald-400" };
}

export default function ShameScoreCard({ data }: Props) {
  const { label, Icon, color } = shameInfo(data.shameScore);
  const chartData = [
    { value: data.shameScore, fill: "#ef4444" },
    { value: 100 - data.shameScore, fill: "#1e293b" },
  ];
  const playedPct = data.total > 0 ? Math.round((data.played / data.total) * 100) : 0;

  return (
    <div className="glass p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Gamepad2 className="h-4 w-4 text-[#66c0f4]" />
        <h2 className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Shame score</h2>
      </div>

      <div className="relative h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="60%" outerRadius="90%"
            startAngle={90} endAngle={-270}
            data={chartData} barSize={14}
          >
            <RadialBar dataKey="value" cornerRadius={8} background={false} isAnimationActive />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums text-red-400">{data.shameScore}%</span>
          <span className="text-xs text-slate-500 mt-1">unplayed</span>
        </div>
      </div>

      <div className={`flex items-center justify-center gap-2 text-sm font-medium ${color}`}>
        <Icon className="h-4 w-4" />
        {label}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Total", value: data.total, color: "text-slate-100" },
          { label: "Played", value: data.played, color: "text-emerald-400" },
          { label: "Unplayed", value: data.unplayed, color: "text-red-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-lg bg-white/5 p-3 text-center">
            <p className={`text-xl font-bold tabular-nums ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {data.total > 0 && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Played</span>
            <span>{playedPct}%</span>
          </div>
          <Progress value={playedPct} className="h-1.5 bg-white/10 [&>div]:bg-emerald-400" />
        </div>
      )}

      {data.topUnplayed.length > 0 && (
        <div>
          <p className="text-xs text-slate-500 mb-2">In the backlog</p>
          <ul className="space-y-1.5">
            {data.topUnplayed.slice(0, 3).map((game) => (
              <li key={game.appid} className="flex items-center gap-2 text-xs text-slate-400">
                <span className="h-1 w-1 rounded-full bg-slate-600 shrink-0" />
                <span className="truncate">{game.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
