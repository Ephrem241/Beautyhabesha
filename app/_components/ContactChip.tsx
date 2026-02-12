"use client";

import {
  DEFAULT_ESCORT_TELEGRAM,
  DEFAULT_ESCORT_WHATSAPP,
} from "@/lib/escort-defaults";
import { buildTelegramUrl, buildWhatsAppUrl } from "@/lib/contact-urls";
import { TelegramIcon, WhatsAppIcon } from "./ContactIcons";

const TELEGRAM_COLOR = "#0088cc";
const WHATSAPP_COLOR = "#25D366";

type ContactChipProps = {
  /** Override telegram handle. Uses admin default when omitted. */
  telegram?: string | null;
  /** Override WhatsApp number. Uses admin default when omitted. */
  whatsapp?: string | null;
  /** Compact: small circular buttons. Inline: slightly larger with label. */
  variant?: "compact" | "inline";
  /** Optional label before the buttons (e.g. "Contact admin:") */
  label?: string;
};

export function ContactChip({
  telegram,
  whatsapp,
  variant = "compact",
  label,
}: ContactChipProps) {
  const tgHandle = telegram?.trim() || DEFAULT_ESCORT_TELEGRAM;
  const waNum = whatsapp?.trim() || DEFAULT_ESCORT_WHATSAPP;
  const tgUrl = buildTelegramUrl(tgHandle);
  const waUrl = buildWhatsAppUrl(waNum);
  const hasAny = Boolean(tgUrl || waUrl);
  if (!hasAny) return null;

  const size = variant === "compact" ? "h-9 w-9" : "h-10 w-10";
  const iconSize = variant === "compact" ? "h-5 w-5" : "h-5 w-5";

  return (
    <div className="flex items-center justify-center gap-2">
      {label ? (
        <span className="text-xs text-zinc-500">{label}</span>
      ) : null}
      <div className="flex gap-2">
        {tgUrl && (
          <a
            href={tgUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex ${size} items-center justify-center rounded-full text-white shadow-md transition hover:scale-110 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0088cc] focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
            style={{ backgroundColor: TELEGRAM_COLOR }}
            aria-label="Contact admin on Telegram"
            title={tgHandle}
          >
            <TelegramIcon className={iconSize} />
          </a>
        )}
        {waUrl && (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex ${size} items-center justify-center rounded-full text-white shadow-md transition hover:scale-110 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-black`}
            style={{ backgroundColor: WHATSAPP_COLOR }}
            aria-label="Contact admin on WhatsApp"
            title={waNum}
          >
            <WhatsAppIcon className={iconSize} />
          </a>
        )}
      </div>
    </div>
  );
}
