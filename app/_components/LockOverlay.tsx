"use client";

import Link from "next/link";
import { motion } from "framer-motion";

type LockOverlayProps = {
  upgradeHref?: string;
  className?: string;
};

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

export function LockOverlay({
  upgradeHref = "/pricing",
  className = "",
}: LockOverlayProps) {
  return (
    <div
      className={`absolute inset-0 flex flex-col items-center justify-center bg-black/30 px-4 ${className}`.trim()}
      role="presentation"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-sm">
          <LockIcon className="h-7 w-7" />
        </div>
        <p className="text-center text-sm font-medium text-white sm:text-base">
          Subscribe to unlock
        </p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Link
            href={upgradeHref}
            aria-label="Upgrade to unlock"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition hover:bg-emerald-400 hover:shadow-[0_0_24px_rgba(16,185,129,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            Upgrade Now
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
