"use client";

import { Trash2 } from "lucide-react";

import type { ChatMessage } from "@/types/chat";

type MessageBubbleProps = {
  message: ChatMessage;
  isOwn: boolean;
  showSender?: boolean;
  canDelete?: boolean;
  onDelete?: (messageId: string) => void;
};

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getSenderLabel(message: ChatMessage) {
  if (message.sender.role === "admin") return "Admin";
  return (
    message.sender.name ??
    message.sender.username ??
    message.sender.email ??
    "User"
  );
}

export function MessageBubble({
  message,
  isOwn,
  showSender,
  canDelete,
  onDelete,
}: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`w-full max-w-[84%] rounded-2xl border px-4 py-3 shadow-sm sm:max-w-[70%] ${
          isOwn
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-50"
            : "border-zinc-800 bg-zinc-950 text-zinc-100"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          {showSender ? (
            <span className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">
              {getSenderLabel(message)}
            </span>
          ) : (
            <span className="text-[11px] uppercase tracking-[0.3em] text-transparent">
              .
            </span>
          )}
          <div className="flex items-center gap-2">
            {canDelete ? (
              <button
                type="button"
                onClick={() => onDelete?.(message.id)}
                className="rounded-full p-1 text-zinc-400 transition hover:text-rose-300"
                aria-label="Delete message"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : null}
            <span className="text-[11px] text-zinc-500">
              {formatTime(message.createdAt)}
            </span>
          </div>
        </div>
        {message.text ? (
          <p className="mt-2 text-sm leading-relaxed text-zinc-100">
            {message.text}
          </p>
        ) : null}
        {message.image ? (
          <div className="mt-3 overflow-hidden rounded-xl border border-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={message.image}
              alt="Attachment"
              className="h-auto w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
