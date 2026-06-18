"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import StoryCard from "@/components/wrapped/StoryCard";
import { useCountUp } from "@/hooks/useCountUp";
import type { SteamGame } from "@/lib/types";

export default function MostPlayedCard({ game, share }: { game: SteamGame; share: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const hours = Math.round(game.playtime_forever / 60);
  const n = useCountUp(hours, { active: inView });
  return (
    <StoryCard>
      <div ref={ref} className="flex flex-col items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://steamcdn-a.akamaihd.net/steam/apps/${game.appid}/header.jpg`}
          alt={game.name}
          className="w-72 rounded-lg shadow-lg"
        />
        <p className="text-lg text-slate-400">Your most played game</p>
        <p className="text-2xl font-bold text-white">{game.name}</p>
        <p className="text-7xl font-bold text-[#66c0f4]">{n}</p>
        <p className="text-lg text-slate-400">hours played</p>
        <p className="text-sm text-slate-500">{share}% of your playtime</p>
      </div>
    </StoryCard>
  );
}
