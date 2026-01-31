"use client";

import { motion } from "framer-motion";

type TelegramButtonProps = {
  telegram?: string | null;
  locked?: boolean;
};

function getTelegramUrl(username: string): string {
  const s = username.replace(/^@/, "").trim();
  if (!s) return "";
  return `https://t.me/${encodeURIComponent(s)}`;
}

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

export function TelegramButton({ telegram, locked = false }: TelegramButtonProps) {
  const url = telegram ? getTelegramUrl(telegram) : "";
  if (!url) return null;

  const tooltip = locked ? "Subscribe to unlock contact" : "Chat on Telegram";
  const ariaLabel = locked ? "Subscribe to unlock contact" : "Chat on Telegram";

  const content = (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={locked ? undefined : { scale: 1.1 }}
      whileTap={locked ? undefined : { scale: 0.95 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 15,
        mass: 0.8,
      }}
      className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg sm:h-16 sm:w-16 ${
        locked
          ? "cursor-not-allowed opacity-60 blur-[1px]"
          : "transition-transform hover:scale-110 active:scale-95"
      }`}
      style={{
        background:
          locked
            ? "linear-gradient(135deg, #404040 0%, #262626 100%)"
            : "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
        color: "#fff",
      }}
    >
      <TelegramIcon className="h-7 w-7 text-white sm:h-8 sm:w-8" />
    </motion.span>
  );

  if (locked) {
    return (
      <span
        className="group fixed z-40"
        style={{
          bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
          right: "calc(1.5rem + env(safe-area-inset-right, 0px))",
        }}
        role="button"
        tabIndex={0}
        aria-label={ariaLabel}
        title={tooltip}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") e.preventDefault();
        }}
      >
        {content}
        <span
          className="pointer-events-none invisible absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-xl opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100"
          aria-hidden
        >
          {tooltip}
        </span>
      </span>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed z-40"
      style={{
        bottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
        right: "calc(1.5rem + env(safe-area-inset-right, 0px))",
      }}
      aria-label={ariaLabel}
      title={tooltip}
    >
      {content}
      <span
        className="pointer-events-none invisible absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-xl opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100"
        aria-hidden
      >
        {tooltip}
      </span>
    </a>
  );
}
