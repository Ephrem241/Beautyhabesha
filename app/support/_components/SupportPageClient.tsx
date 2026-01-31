"use client";

import Link from "next/link";
import { useSupportChat } from "./useSupportChat";
import { SupportChatPanel } from "./SupportChatPanel";

export function SupportPageClient({ userId }: { userId: string }) {
  const chat = useSupportChat({ userId });

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-zinc-400 transition hover:text-white"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>
        <h1 className="text-base font-semibold text-white">Support Chat</h1>
        <div className="w-9" />
      </header>
      <div className="min-h-0 flex-1">
        <SupportChatPanel chat={chat} />
      </div>
    </div>
  );
}
