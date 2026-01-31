"use client";

import Link from "next/link";

type IHavePaidButtonProps = {
  href: string;
  label: string;
};

export function IHavePaidButton({ href, label }: IHavePaidButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-4 text-base font-semibold uppercase tracking-[0.2em] text-emerald-950 shadow-lg shadow-emerald-400/20 transition hover:bg-emerald-300 hover:shadow-emerald-400/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
    >
      <svg
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 13l4 4L19 7"
        />
      </svg>
      {label}
    </Link>
  );
}
