"use client";

import { MessageCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

export type ChatPlatform = "telegram" | "whatsapp";

export type ChatFloatingButtonProps = {
  /** Telegram username (without @). Link: https://t.me/username */
  telegramUsername?: string | null;
  /** WhatsApp number in international format. Will be normalized to digits only for wa.me */
  whatsappNumber?: string | null;
  /** Show chat button only when user has active subscription. */
  isAllowed: boolean;
  /** Optional aria-label for the main chat button. */
  ariaLabel?: string;
};

const TELEGRAM_COLOR = "#0088cc";
const WHATSAPP_COLOR = "#25D366";

function normalizeWhatsAppNumber(num: string): string {
  return num.replace(/\D/g, "");
}

function buildWhatsAppUrl(number: string): string {
  const digits = normalizeWhatsAppNumber(number);
  return digits ? `https://wa.me/${digits}` : "";
}

function buildTelegramUrl(username: string): string {
  const clean = username.replace(/^@/, "").trim();
  return clean ? `https://t.me/${encodeURIComponent(clean)}` : "";
}

type IconProps = { className?: string; style?: React.CSSProperties };

function TelegramIcon({ className, style }: IconProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function WhatsAppIcon({ className, style }: IconProps) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * Floating chat button with Telegram / WhatsApp toggle.
 * Defaults to Telegram. Opens chat in new tab. Hidden when not subscribed.
 */
export function ChatFloatingButton({
  telegramUsername,
  whatsappNumber,
  isAllowed,
  ariaLabel = "Open chat",
}: ChatFloatingButtonProps) {
  const hasTelegram = Boolean(telegramUsername?.trim());
  const hasWhatsApp = Boolean(whatsappNumber?.trim());
  const hasAny = hasTelegram || hasWhatsApp;

  const defaultPlatform: ChatPlatform = useMemo(() => {
    if (hasTelegram) return "telegram";
    if (hasWhatsApp) return "whatsapp";
    return "telegram";
  }, [hasTelegram, hasWhatsApp]);

  const [platform, setPlatform] = useState<ChatPlatform>(defaultPlatform);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setPlatform(defaultPlatform);
  }, [defaultPlatform]);

  const telegramUrl = useMemo(
    () => (telegramUsername ? buildTelegramUrl(telegramUsername) : ""),
    [telegramUsername]
  );
  const whatsappUrl = useMemo(
    () => (whatsappNumber ? buildWhatsAppUrl(whatsappNumber) : ""),
    [whatsappNumber]
  );

  const currentUrl = platform === "telegram" ? telegramUrl : whatsappUrl;
  const canOpen = Boolean(currentUrl);

  const openChat = useCallback(() => {
    if (!canOpen) return;
    window.open(currentUrl, "_blank", "noopener,noreferrer");
  }, [canOpen, currentUrl]);

  const showToggle = hasTelegram && hasWhatsApp;

  if (!isAllowed || !hasAny) {
    return null;
  }

  return (
    <div
      className="fixed bottom-6 right-4 z-40 flex flex-col items-end gap-2 sm:bottom-8 sm:right-6"
      role="group"
      aria-label="Chat options"
    >
      {/* Toggle strip: only when both platforms available */}
      {showToggle && (
        <div
          className={`flex overflow-hidden rounded-full border border-zinc-700 bg-zinc-900/95 shadow-lg ring-1 ring-black/20 backdrop-blur-sm transition-all duration-300 ease-out ${
            isExpanded ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
          }`}
          aria-hidden={!isExpanded}
        >
          <button
            type="button"
            onClick={() => setPlatform("telegram")}
            className={`flex items-center gap-2 px-4 py-2.5 transition-colors ${
              platform === "telegram"
                ? "bg-[#0088cc]/20 text-[#0088cc]"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
            aria-pressed={platform === "telegram"}
            aria-label="Use Telegram"
            style={platform === "telegram" ? { color: TELEGRAM_COLOR } : undefined}
          >
            <TelegramIcon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">Telegram</span>
          </button>
          <button
            type="button"
            onClick={() => setPlatform("whatsapp")}
            className={`flex items-center gap-2 border-l border-zinc-700 px-4 py-2.5 transition-colors ${
              platform === "whatsapp"
                ? "bg-[#25D366]/20 text-[#25D366]"
                : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
            aria-pressed={platform === "whatsapp"}
            aria-label="Use WhatsApp"
            style={
              platform === "whatsapp" ? { color: WHATSAPP_COLOR } : undefined
            }
          >
            <WhatsAppIcon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">WhatsApp</span>
          </button>
        </div>
      )}

      {/* Main floating button */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={openChat}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-lg ring-1 ring-black/20 transition-all duration-200 hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-16 sm:w-16"
          style={{
            backgroundColor: platform === "telegram" ? TELEGRAM_COLOR : WHATSAPP_COLOR,
            color: "#fff",
          }}
          aria-label={
            platform === "telegram"
              ? `${ariaLabel} (Telegram)`
              : `${ariaLabel} (WhatsApp)`
          }
        >
          <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8" aria-hidden />
        </button>

        {showToggle && (
          <button
            type="button"
            onClick={() => setIsExpanded((e) => !e)}
            className="flex h-14 items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/95 px-4 py-2 shadow-lg ring-1 ring-black/20 backdrop-blur-sm transition-all duration-200 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:h-16"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Close chat options" : "Choose chat app"}
          >
            {platform === "telegram" ? (
              <TelegramIcon
                className="h-6 w-6 shrink-0"
                style={{ color: TELEGRAM_COLOR }}
              />
            ) : (
              <WhatsAppIcon
                className="h-6 w-6 shrink-0"
                style={{ color: WHATSAPP_COLOR }}
              />
            )}
            <span className="max-w-0 overflow-hidden text-sm font-medium opacity-0 transition-all duration-300 ease-out sm:max-w-[120px] sm:opacity-100">
              {platform === "telegram" ? "Telegram" : "WhatsApp"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
