"use client";

import Link from "next/link";
import { type ReactNode } from "react";

type BlurGateProps = {
  /** When false, content is blurred and overlay with CTA is shown. */
  isAllowed: boolean;
  children: ReactNode;
  /** Optional class for the wrapper (e.g. min-height for overlay alignment). */
  className?: string;
  /** CTA href. Default /pricing. */
  upgradeHref?: string;
};

export function BlurGate({
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

  return (
    <div
      className={`relative overflow-hidden ${className}`.trim()}
      aria-hidden={false}
    >
      <div
        className="select-none transition-all duration-300 will-change-[filter] [&_img]:blur-sm [&_img]:brightness-75"
        aria-hidden="true"
      >
        {children}
      </div>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-linear-to-b from-black/20 via-black/10 to-black/20 px-4 py-6"
        role="presentation"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-zinc-500/80 bg-zinc-900/90 text-zinc-400">
          <LockIcon className="h-6 w-6" />
        </div>
        <p className="text-center text-sm font-medium text-white sm:text-base">
          Subscribe to view full profile
        </p>
        <Link
          href={upgradeHref}
          className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-950 transition hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}
