"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import StoryCard from "@/components/wrapped/StoryCard";
import { useCountUp } from "@/hooks/useCountUp";

export default function GamesOwnedCard({ total }: { total: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const n = useCountUp(total, { active: inView });
  return (
    <StoryCard>
      <div ref={ref}>
        <p className="text-lg text-slate-400">You own</p>
        <p className="my-3 text-7xl font-bold text-[#66c0f4]">{n}</p>
        <p className="text-lg text-slate-400">games on Steam</p>
      </div>
    </StoryCard>
  );
}
