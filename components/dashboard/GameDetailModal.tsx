"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, Gamepad2, ExternalLink, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getGenreForGame } from "@/lib/genre-map";
import type { SteamGame, GameWithMeta } from "@/lib/types";

type GameProp = SteamGame | GameWithMeta;

interface Props {
  game: GameProp | null;
  onClose: () => void;
}

function formatPlaytime(minutes: number): string {
  if (minutes === 0) return "Never played";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export default function GameDetailModal({ game, onClose }: Props) {
  if (!game) return null;

  const genre = ("genres" in game && game.genres && game.genres.length > 0)
    ? game.genres[0]
    : getGenreForGame(game);
  const isUnplayed = game.playtime_forever === 0;
  const recentHours = game.playtime_2weeks ? Math.floor(game.playtime_2weeks / 60) : null;
  const storeUrl = `https://store.steampowered.com/app/${game.appid}/`;
  const headerUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/header.jpg`;
  const heroUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${game.appid}/library_hero.jpg`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 8 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#141d27] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Hero image */}
          <div className="relative">
            <img
              src={heroUrl}
              alt=""
              className="w-full h-28 object-cover"
              onError={(e) => {
                const img = e.currentTarget;
                img.src = headerUrl;
                img.className = "w-full aspect-[460/215] object-cover";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141d27] via-[#141d27]/40 to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 rounded-full bg-black/50 p-1.5 text-slate-300 hover:text-white hover:bg-black/80 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Header image + title row */}
          <div className="px-5 -mt-10 flex items-end gap-4">
            <img
              src={headerUrl}
              alt={game.name}
              className="w-28 rounded-lg border border-white/10 shadow-lg shrink-0 object-cover"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <div className="pb-1 min-w-0">
              <h3 className="text-base font-bold text-slate-100 leading-tight line-clamp-2">{game.name}</h3>
              {game.tags && game.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {game.tags.slice(0, 6).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[9px] border-white/10 text-slate-400 bg-white/5 px-1.5 py-0"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : genre !== "Unknown" && (
                <Badge variant="outline" className="mt-1.5 text-[10px] border-[#66c0f4]/30 text-[#66c0f4] bg-[#66c0f4]/10">
                  {genre}
                </Badge>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="px-5 pt-4 pb-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/5 p-3">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
                  <Clock className="h-3 w-3" />
                  Total playtime
                </div>
                <p className={`text-xl font-bold tabular-nums ${isUnplayed ? "text-slate-500" : "text-slate-100"}`}>
                  {formatPlaytime(game.playtime_forever)}
                </p>
              </div>

              {recentHours !== null ? (
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
                    <CalendarDays className="h-3 w-3" />
                    Last 2 weeks
                  </div>
                  <p className="text-xl font-bold tabular-nums text-emerald-400">{recentHours}h</p>
                </div>
              ) : (
                <div className="rounded-lg bg-white/5 p-3">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1 uppercase tracking-wider">
                    <Gamepad2 className="h-3 w-3" />
                    Status
                  </div>
                  <p className={`text-sm font-semibold ${isUnplayed ? "text-slate-500" : "text-emerald-400"}`}>
                    {isUnplayed ? "Not started" : "Played"}
                  </p>
                </div>
              )}
            </div>

            <a href={storeUrl} target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="w-full gap-2 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
              >
                <ExternalLink className="h-4 w-4" />
                View on Steam
              </Button>
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
