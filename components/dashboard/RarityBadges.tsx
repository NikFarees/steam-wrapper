// components/dashboard/RarityBadges.tsx

"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import type { RarityBadge } from "@/lib/types";

interface Props { badges: RarityBadge[] }

const shimmerVariants: Variants = {
  rest: {
    background: "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0) 80%, rgba(255,255,255,0) 100%)",
    scale: 1,
    y: 0,
  },
  hover: {
    background: "linear-gradient(135deg, rgba(255,215,0,0.15) 0%, rgba(192,192,192,0.25) 40%, rgba(255,215,0,0.15) 80%, rgba(255,255,255,0.05) 100%)",
    scale: 1.04,
    y: -4,
    transition: { duration: 0.25, ease: "easeOut" },
  },
};

function rarityTier(pct: number) {
  if (pct <= 5)  return { label: "Ultra Rare", color: "text-amber-400" };
  if (pct <= 10) return { label: "Rare",       color: "text-purple-400" };
  if (pct <= 25) return { label: "Uncommon",   color: "text-blue-400" };
  return              { label: "Common",       color: "text-slate-400" };
}

export default function RarityBadges({ badges }: Props) {
  return (
    <div className="glass p-6 flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-slate-100">Rarity Badges</h2>
      <p className="text-xs text-slate-500">Your rarest Steam achievements</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((badge) => {
          const { label, color } = rarityTier(badge.globalPercentage);
          return (
            <motion.div
              key={`${badge.appid}-${badge.achievementApiName}`}
              variants={shimmerVariants}
              initial="rest"
              whileHover="hover"
              className="relative flex flex-col items-center gap-2 rounded-xl border border-white/10 p-3 cursor-pointer overflow-hidden"
              style={{ backgroundColor: "rgba(255,255,255,0.03)" }}
            >
              <div className="relative h-12 w-12 rounded-full overflow-hidden ring-2 ring-white/10">
                <Image
                  src={badge.iconUrl}
                  alt={badge.achievementName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-200 leading-tight line-clamp-2">
                  {badge.achievementName}
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{badge.gameName}</p>
                <p className={`text-[10px] font-bold mt-1 ${color}`}>{label}</p>
                <p className="text-[10px] text-slate-600">{badge.globalPercentage.toFixed(1)}% players</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
