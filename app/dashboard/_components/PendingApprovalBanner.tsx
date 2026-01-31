"use client";

import Link from "next/link";

type PendingApprovalBannerProps = {
  planName: string;
  planSlug: string;
};

export function PendingApprovalBanner({
  planName,
  planSlug,
}: PendingApprovalBannerProps) {
  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20">
            <svg
              className="h-4 w-4 animate-pulse text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-amber-200">
              Pending approval
            </p>
            <p className="text-xs text-amber-200/80">
              Your {planName} payment is being reviewed. Features will unlock
              once approved.
            </p>
          </div>
        </div>
        <Link
          href={`/upload-proof?plan=${planSlug}`}
          className="shrink-0 text-xs font-semibold uppercase tracking-[0.15em] text-amber-300 hover:text-amber-200"
        >
          View status
        </Link>
      </div>
    </div>
  );
}
