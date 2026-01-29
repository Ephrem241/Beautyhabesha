"use client";

import { useEffect, useState } from "react";

const TELEGRAM_BRAND = "#0088cc";

type TelegramFloatingButtonProps = {
  /** Telegram URL (e.g. https://t.me/yourchannel) or username (we build t.me/username). */
  href: string;
  /** Optional. Override tooltip text. */
  tooltip?: string;
  /** Optional. Accessible label for the button. */
  ariaLabel?: string;
};

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function normalizeHref(input: string): string {
  const s = input.replace(/^@/, "").trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  return `https://t.me/${encodeURIComponent(s)}`;
}

export function TelegramFloatingButton({
  href,
  tooltip = "Chat on Telegram",
  ariaLabel = "Chat on Telegram",
}: TelegramFloatingButtonProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const h = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);

  const url = normalizeHref(href);
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-lg ring-1 ring-black/15 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0088cc] focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
      style={{ backgroundColor: TELEGRAM_BRAND, color: "#fff" }}
      aria-label={ariaLabel}
      title={tooltip}
    >
      {!reduceMotion && (
        <span
          className="pointer-events-none absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ backgroundColor: TELEGRAM_BRAND }}
          aria-hidden
        />
      )}
      <TelegramIcon className="relative h-7 w-7 text-white sm:h-8 sm:w-8" />

      {/* Hover tooltip (native title used for a11y) */}
      <span
        className="invisible absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-xl opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100"
        aria-hidden="true"
      >
        {tooltip}
      </span>
    </a>
  );
}
