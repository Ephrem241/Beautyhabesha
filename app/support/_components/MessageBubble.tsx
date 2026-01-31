"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export type MessageBubbleProps = {
  id: string;
  text: string | null;
  image: string | null;
  createdAt: string | Date;
  isOwn: boolean;
  senderName: string;
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
};

export function MessageBubble({
  id,
  text,
  image,
  createdAt,
  isOwn,
  senderName,
  isAdmin,
  onDelete,
}: MessageBubbleProps) {
  const time = new Date(createdAt).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`group relative max-w-[85%] sm:max-w-[75%] ${
          isOwn ? "order-2" : "order-1"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 ${
            isOwn
              ? "rounded-br-md bg-emerald-600 text-white"
              : "rounded-bl-md bg-zinc-800 text-zinc-100"
          }`}
        >
          {!isOwn && (
            <p className="mb-0.5 text-xs font-medium text-emerald-400/90">
              {senderName}
              {isAdmin ? " (Support)" : ""}
            </p>
          )}
          {text && <p className="whitespace-pre-wrap break-words text-sm">{text}</p>}
          {image && (
            <a
              href={image}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 block overflow-hidden rounded-lg"
            >
              <Image
                src={image}
                alt="Attachment"
                width={280}
                height={200}
                className="max-h-48 w-auto rounded-lg object-cover"
              />
            </a>
          )}
          <p
            className={`mt-1 text-[10px] ${
              isOwn ? "text-emerald-200/80" : "text-zinc-500"
            }`}
          >
            {time}
          </p>
        </div>
        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(id)}
            className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500/90 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Delete message"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
}
