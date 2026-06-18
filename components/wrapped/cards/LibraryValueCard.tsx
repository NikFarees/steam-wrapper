"use client";
import { useRef } from "react";
import { useInView } from "framer-motion";
import StoryCard from "@/components/wrapped/StoryCard";
import { useCountUp } from "@/hooks/useCountUp";
import type { LibraryValueData } from "@/lib/types";

export default function LibraryValueCard({ value }: { value: LibraryValueData }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.6 });
  const dollars = Math.floor(value.totalCents / 100);
  const n = useCountUp(dollars, { active: inView });
  return (
    <StoryCard>
      <div ref={ref}>
        <p className="text-lg text-slate-400">Your library is worth</p>
        <p className="my-3 text-7xl font-bold text-[#66c0f4]">${n}</p>
        <p className="text-sm text-slate-500">
          estimated library value · not money spent
        </p>
      </div>
    </StoryCard>
  );
}
