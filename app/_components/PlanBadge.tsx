import type { PlanId } from "@/lib/plans";

export type PlanBadgeProps = {
  planId: PlanId;
  /** Show "Featured" for Platinum. */
  showFeatured?: boolean;
  className?: string;
};

/**
 * Plan tier badge. Platinum: glow-style; VIP: highlighted; Normal: standard.
 */
export function PlanBadge({
  planId,
  showFeatured = false,
  className = "",
}: PlanBadgeProps) {
  const isPlatinum = planId === "Platinum";
  const isVIP = planId === "VIP";
  const isNormal = planId === "Normal";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <span
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${
          isPlatinum
            ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/50"
            : isVIP
              ? "bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40"
              : "bg-zinc-700/80 text-zinc-400"
        }`}
        aria-label={`Plan: ${planId}`}
      >
        {planId}
      </span>
      {isPlatinum && showFeatured ? (
        <span
          className="inline-block rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-200"
          aria-hidden
        >
          Featured
        </span>
      ) : null}
    </div>
  );
}
