"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import StoryCard from "@/components/wrapped/StoryCard";
import { useCountUp } from "@/hooks/useCountUp";

export default function PlaytimeCard({ hours, days }: { hours: number; days: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const n = useCountUp(hours, { active: inView });
  return (
    <StoryCard>
      <div ref={ref}>
        <p className="text-lg text-slate-400">You&apos;ve played</p>
        <p className="my-3 text-7xl font-bold text-[#66c0f4]">{n}</p>
        <p className="text-lg text-slate-400">hours on Steam</p>
        <p className="mt-2 text-sm text-slate-500">that&apos;s {days} days</p>
      </div>
    </StoryCard>
  );
}
