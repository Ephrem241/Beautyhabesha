"use client";

import { Paperclip, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type MessageInputProps = {
  onSend: (payload: { text: string; file: File | null }) => Promise<void> | void;
  onTyping?: (isTyping: boolean) => void;
  disabled?: boolean;
  placeholder?: string;
  allowUpload?: boolean;
};

export function MessageInput({
  onSend,
  onTyping,
  disabled,
  placeholder = "Type your message...",
  allowUpload = true,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleTyping = (value: string) => {
    onTyping?.(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping?.(false);
    }, 900);
    setText(value);
  };

  const handleSend = async () => {
    if (disabled) return;
    const trimmed = text.trim();
    if (!trimmed && !file) return;
    await onSend({ text: trimmed, file });
    setText("");
    setFile(null);
    onTyping?.(false);
  };

  const isSendDisabled = disabled || (!text.trim() && !file);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
      {previewUrl ? (
        <div className="relative mb-3 overflow-hidden rounded-xl border border-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Selected upload"
            className="h-40 w-full object-cover"
          />
          <button
            type="button"
            onClick={() => setFile(null)}
            className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-white transition hover:bg-black"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        {allowUpload ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const selected = event.target.files?.[0] ?? null;
                setFile(selected);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 text-zinc-300 transition hover:border-emerald-400 hover:text-emerald-200"
              aria-label="Attach image"
            >
              <Paperclip className="h-5 w-5" />
            </button>
          </>
        ) : null}

        <div className="flex-1">
          <textarea
            value={text}
            onChange={(event) => handleTyping(event.target.value)}
            placeholder={placeholder}
            rows={1}
            className="min-h-[44px] w-full resize-none rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
          />
        </div>

        <button
          type="button"
          onClick={handleSend}
          disabled={isSendDisabled}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-emerald-950 transition enabled:hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
