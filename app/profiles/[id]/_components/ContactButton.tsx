"use client";

import Link from "next/link";
import {
  DEFAULT_ESCORT_TELEGRAM,
  DEFAULT_ESCORT_WHATSAPP,
} from "@/lib/escort-defaults";
import {
  buildTelegramUrlWithText,
  buildWhatsAppUrlWithText,
} from "@/lib/contact-urls";
import { TelegramIcon, WhatsAppIcon } from "@/app/_components/ContactIcons";

type ContactButtonProps = {
  profileId: string;
  disabled: boolean;
  upgradeHref?: string;
  /** Model display name for pre-filled message to admin (which model user is interested in) */
  displayName?: string;
};

const GLASS_CLASSES =
  "bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-2xl";
const HOVER_CLASSES = "hover:bg-zinc-800/80 hover:scale-[1.02] transition";

export function ContactButton({
  profileId,
  disabled,
  upgradeHref = "/pricing",
  displayName,
}: ContactButtonProps) {
  const prefillText = displayName
    ? `Hi, I'm interested in ${displayName}`
    : "";
  const tgUrl = buildTelegramUrlWithText(DEFAULT_ESCORT_TELEGRAM, prefillText);
  const waUrl = buildWhatsAppUrlWithText(DEFAULT_ESCORT_WHATSAPP, prefillText);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:px-6 md:pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
      {disabled ? (
        <Link
          href={upgradeHref}
          className={`flex h-[60px] w-full items-center justify-center gap-3 ${GLASS_CLASSES} ${HOVER_CLASSES} text-base font-semibold text-white shadow-lg`}
        >
          <svg
            className="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
          <span>Subscribe to Contact</span>
        </Link>
      ) : (
        <div className={`grid grid-cols-2 gap-2 sm:gap-3 ${GLASS_CLASSES} p-2 sm:p-3`}>
          <a
            href={tgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-3 ${HOVER_CLASSES} text-white`}
            style={{ backgroundColor: "rgba(0, 136, 204, 0.25)" }}
          >
            <TelegramIcon className="h-6 w-6" />
            <span className="text-xs font-medium">
              <span className="sm:hidden">Telegram</span>
              <span className="hidden sm:inline">Contact via Telegram</span>
            </span>
          </a>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-3 ${HOVER_CLASSES} text-white`}
            style={{ backgroundColor: "rgba(37, 211, 102, 0.25)" }}
          >
            <WhatsAppIcon className="h-6 w-6" />
            <span className="text-xs font-medium">
              <span className="sm:hidden">WhatsApp</span>
              <span className="hidden sm:inline">Contact via WhatsApp</span>
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
