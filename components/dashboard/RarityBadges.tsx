"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

function rarityTier(pct: number): { label: string; className: string } {
  if (pct <= 5)  return { label: "Ultra Rare", className: "border-amber-500/30 text-amber-400 bg-amber-500/10" };
  if (pct <= 10) return { label: "Rare",       className: "border-purple-500/30 text-purple-400 bg-purple-500/10" };
  if (pct <= 25) return { label: "Uncommon",   className: "border-blue-500/30 text-blue-400 bg-blue-500/10" };
  return              { label: "Common",       className: "border-slate-500/30 text-slate-400 bg-slate-500/10" };
}

export default function RarityBadges({ badges }: Props) {
  return (
    <div className="glass p-6 flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <Medal className="h-4 w-4 text-[#66c0f4]" />
        <h2 className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Rarest achievements</h2>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {badges.map((badge) => {
          const { label, className: badgeClass } = rarityTier(badge.globalPercentage);
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
              <div className="text-center space-y-1">
                <p className="text-xs font-semibold text-slate-200 leading-tight line-clamp-2">
                  {badge.achievementName}
                </p>
                <p className="text-[10px] text-slate-500 line-clamp-1">{badge.gameName}</p>
                <Badge variant="outline" className={`text-[9px] py-0 px-1.5 h-4 ${badgeClass}`}>
                  {label}
                </Badge>
                <p className="text-[10px] text-slate-600">{badge.globalPercentage.toFixed(1)}% of players</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
