"use client";

import { motion, useReducedMotion } from "framer-motion";
import { buildTelegramUrl } from "@/lib/contact-urls";
import { TelegramIcon } from "./ContactIcons";

type TelegramButtonProps = {
  telegram?: string | null;
  locked?: boolean;
};

export function TelegramButton({ telegram, locked = false }: TelegramButtonProps) {
  const url = telegram ? buildTelegramUrl(telegram) : "";
  const prefersReducedMotion = useReducedMotion();

  if (!url) return null;

  const tooltip = locked ? "Subscribe to unlock contact" : "Chat on Telegram";
  const ariaLabel = locked ? "Subscribe to unlock contact" : "Chat on Telegram";

  const content = (
    <motion.span
      initial={prefersReducedMotion ? false : { scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={locked || prefersReducedMotion ? undefined : { scale: 1.1 }}
      whileTap={locked || prefersReducedMotion ? undefined : { scale: 0.95 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 400, damping: 15, mass: 0.8 }
      }
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
