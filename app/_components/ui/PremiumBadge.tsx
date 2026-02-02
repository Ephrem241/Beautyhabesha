"use client";

import { motion } from "framer-motion";

export type PremiumBadgeType = "vip" | "platinum";

type PremiumBadgeProps = {
  type: PremiumBadgeType;
  className?: string;
};

function CrownIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2L14.5 8.5L21 9L16 13.5L17.5 20L12 17L6.5 20L8 13.5L3 9L9.5 8.5L12 2Z" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2L2 9L12 22L22 9L12 2ZM12 6.5L18 9L12 18L6 9L12 6.5Z" />
    </svg>
  );
}

export function PremiumBadge({ type, className = "" }: PremiumBadgeProps) {
  const isVip = type === "vip";

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={`absolute left-3 top-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${className} ${isVip ? "bg-linear-to-br from-amber-400 via-amber-500 to-amber-700 text-amber-950 shadow-lg shadow-amber-500/40" : ""}`}
      aria-label={`${type} badge`}
    >
      {isVip ? (
        <>
          <CrownIcon />
          <span>VIP</span>
        </>
      ) : (
        <span className="flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-3 py-1 text-zinc-100 shadow-[0_0_20px_rgba(255,255,255,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-md">
          <DiamondIcon />
          Platinum
        </span>
      )}
    </motion.span>
  );
}
