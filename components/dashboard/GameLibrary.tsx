"use client";

import { useState } from "react";
import { Library } from "lucide-react";
import GameDetailModal from "@/components/dashboard/GameDetailModal";
import type { SteamGame } from "@/lib/types";

interface Props { games: SteamGame[] }

function GameCard({ game, onClick }: { game: SteamGame; onClick: () => void }) {
  const hours = Math.floor(game.playtime_forever / 60);
  const isUnplayed = game.playtime_forever === 0;
  const headerUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`;

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col rounded-xl overflow-hidden border border-white/10 bg-white/3 hover:border-[#66c0f4]/40 hover:bg-white/5 transition-all duration-150 text-left"
    >
      <div className="relative overflow-hidden">
        <img
          src={headerUrl}
          alt={game.name}
          loading="lazy"
          className={`w-full aspect-[460/215] object-cover transition-transform duration-200 group-hover:scale-105 ${isUnplayed ? "opacity-40 grayscale" : ""}`}
          onError={(e) => {
            e.currentTarget.parentElement!.style.background = "#1e293b";
            e.currentTarget.style.display = "none";
          }}
        />
        {isUnplayed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-medium text-slate-400 bg-black/60 px-2 py-0.5 rounded-full">
              Unplayed
            </span>
          </div>
        )}
      </div>
      <div className="px-2.5 py-2">
        <p className="text-xs font-medium text-slate-300 truncate leading-tight">{game.name}</p>
        <p className="text-[10px] text-slate-500 mt-0.5">
          {isUnplayed ? "Not started" : `${hours}h played`}
        </p>
      </div>
    </button>
  );
}

export default function GameLibrary({ games }: Props) {
  const [selected, setSelected] = useState<SteamGame | null>(null);

  if (games.length === 0) return null;

  const sorted = [...games].sort((a, b) => b.playtime_forever - a.playtime_forever);

  return (
    <div className="glass p-6 flex flex-col gap-5 col-span-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Library className="h-4 w-4 text-[#66c0f4]" />
          <h2 className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Library</h2>
        </div>
        <span className="text-xs text-slate-500">{games.length} games</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {sorted.map((game) => (
          <GameCard key={game.appid} game={game} onClick={() => setSelected(game)} />
        ))}
      </div>

      <GameDetailModal game={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
