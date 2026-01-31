"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";
import type { useSupportChat } from "./useSupportChat";

type SupportChatPanelProps = {
  chat: ReturnType<typeof useSupportChat>;
  isAdmin?: boolean;
  compact?: boolean;
};

export function SupportChatPanel({
  chat,
  isAdmin,
  compact,
}: SupportChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    roomId,
    currentRoom,
    sending,
    typing,
    sendMessage,
    sendTyping,
    deleteMessage,
    loading,
    ensureRoom,
  } = chat;

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (compact && !roomId) {
      ensureRoom();
    }
  }, [compact, roomId, ensureRoom]);

  if (loading && !roomId && !compact) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        <p className="text-sm text-zinc-400">Loading chat...</p>
      </div>
    );
  }

  const displayName =
    currentRoom?.user?.name ??
    currentRoom?.user?.username ??
    currentRoom?.user?.email ??
    "Support";

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-zinc-950">
      {(currentRoom || compact) && (
        <div className="flex shrink-0 items-center gap-3 border-b border-zinc-800 px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
            {displayName.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {displayName || "Support"}
            </p>
            <p className="text-xs text-zinc-500">
              {currentRoom?.resolved ? "Resolved" : "Support"}
            </p>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto p-4"
      >
        {messages.length === 0 && !sending ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-sm text-zinc-500">
              Start the conversation. Our support team will respond soon.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                id={msg.id}
                text={msg.text}
                image={msg.image}
                createdAt={msg.createdAt}
                isOwn={msg.senderId === chat.userId}
                senderName={
                  msg.sender?.name ?? msg.sender?.username ?? "User"
                }
                isAdmin={msg.sender?.role === "admin"}
                onDelete={isAdmin ? deleteMessage : undefined}
              />
            ))}
          </div>
        )}

        <AnimatePresence>
          {typing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 flex items-center gap-2 text-xs text-zinc-500"
            >
              <span className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-zinc-500 [animation-delay:300ms]" />
              </span>
              Typing...
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <MessageInput
        onSend={sendMessage}
        onTyping={sendTyping}
        disabled={sending}
        placeholder="Message support..."
      />
    </div>
  );
}
