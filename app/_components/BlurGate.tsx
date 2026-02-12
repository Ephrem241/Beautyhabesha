"use client";

import Link from "next/link";
import { memo, type ReactNode } from "react";

type BlurGateProps = {
  /** When false, content is blurred with lock overlay. */
  isAllowed: boolean;
  children: ReactNode;
  /** Optional class for the wrapper. */
  className?: string;
  /** CTA href for Upgrade Now button. */
  upgradeHref?: string;
};

export const BlurGate = memo(function BlurGate({
  isAllowed,
  children,
  className = "",
  upgradeHref = "/pricing",
}: BlurGateProps) {
  if (isAllowed) {
    return (
      <div className={`transition-opacity duration-300 ease-out ${className}`.trim()}>
        {children}
      </div>
    );
  }

  // Blurred image + lock overlay - content completely unrecognizable to encourage subscriptions
  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`.trim()}>
      <div
        className="absolute inset-0 h-full w-full overflow-hidden select-none transition-all duration-300 will-change-filter"
        style={{
          filter: "blur(8px) brightness(0.50)",
        }}
        aria-hidden="true"
      >
        {children}
      </div>
      {/* Lock overlay – centered card only, no full-screen darkening */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none z-10"
        aria-hidden="true"
      >
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-black/60 px-6 py-5 backdrop-blur-sm shadow-xl pointer-events-auto">
          <svg
            className="h-12 w-12 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span className="text-sm font-medium text-white drop-shadow-sm">
            Subscribe to unlock
          </span>
          <Link
            href={upgradeHref}
            className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-lg transition hover:bg-emerald-400"
          >
            Upgrade Now
          </Link>
        </div>
      </div>
    </div>
  );
});
