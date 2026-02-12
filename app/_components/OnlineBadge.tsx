"use client";

import { isOnline } from "@/lib/online-status";

type OnlineBadgeProps = {
  lastActiveAt?: Date | null;
  /** When true, show "Online" label next to the dot. Default: dot only. */
  showLabel?: boolean;
  className?: string;
};

export function OnlineBadge({ lastActiveAt, showLabel, className }: OnlineBadgeProps) {
  if (!isOnline(lastActiveAt)) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-emerald-400 ${className ?? ""}`}
      title="Online now"
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
        aria-hidden
      />
      {showLabel ? (
        <span className="text-xs font-medium uppercase tracking-wider">Online</span>
      ) : null}
    </span>
  );
}
