"use client";

import { MessageCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { getSocket } from "@/lib/socket-client";
import type { ChatMessage, ChatRoomSummary } from "@/types/chat";

import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

type ChatWidgetProps = {
  userId: string;
  userRole: "user" | "escort" | "admin";
  initialRoom?: ChatRoomSummary | null;
  initialMessages?: ChatMessage[];
};

type PresencePayload = {
  roomId: string;
  userOnline: boolean;
  adminOnline: boolean;
};

type SocketMessagePayload = {
  roomId: string;
  message: ChatMessage;
  room?: ChatRoomSummary;
};

type TypingPayload = {
  roomId: string;
  senderId: string;
  senderRole?: "admin" | "user" | "escort";
};

export function ChatWidget({
  userId,
  userRole,
  initialRoom = null,
  initialMessages = [],
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [room, setRoom] = useState<ChatRoomSummary | null>(initialRoom);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminTyping, setAdminTyping] = useState(false);
  const [adminOnline, setAdminOnline] = useState(false);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const headerStatus = useMemo(() => {
    if (!room) return "Start a new support chat";
    if (room.resolved) return "Resolved • Reply to reopen";
    if (adminOnline) return "Admin online";
    return "Admin offline";
  }, [room, adminOnline]);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShouldAutoScroll(atBottom);
  };

  const loadRoom = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat/rooms", { cache: "no-store" });
      const data = await response.json();
      if (response.ok && data.room) {
        setRoom(data.room);
        await loadMessages(data.room.id);
      }
    } catch (err) {
      console.error("Failed to load room", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    const response = await fetch(`/api/chat/rooms/${roomId}`, {
      cache: "no-store",
    });
    const data = await response.json();
    if (response.ok) {
      setRoom(data.room);
      setMessages(data.messages ?? []);
      setTimeout(scrollToBottom, 50);
    }
  };

  useEffect(() => {
    if (!room) {
      void loadRoom();
    }
  }, []);

  useEffect(() => {
    if (!room?.id) return;
    const socket = getSocket();
    socket.emit("join_room", { roomId: room.id, role: userRole, userId });

    const handleMessage = (payload: SocketMessagePayload) => {
      if (payload.roomId !== room.id) return;
      setMessages((prev) =>
        prev.some((message) => message.id === payload.message.id)
          ? prev
          : [...prev, payload.message]
      );
      if (payload.room) {
        setRoom(payload.room);
      }
    };

    const handleTyping = (payload: TypingPayload) => {
      if (payload.roomId !== room.id) return;
      if (payload.senderId === userId) return;
      if (payload.senderRole !== "admin") return;
      setAdminTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => setAdminTyping(false), 1200);
    };

    const handleStopTyping = (payload: TypingPayload) => {
      if (payload.roomId !== room.id) return;
      if (payload.senderRole !== "admin") return;
      setAdminTyping(false);
    };

    const handlePresence = (payload: PresencePayload) => {
      if (payload.roomId !== room.id) return;
      setAdminOnline(payload.adminOnline);
    };

    socket.on("receive_message", handleMessage);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);
    socket.on("room_presence", handlePresence);

    return () => {
      socket.off("receive_message", handleMessage);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
      socket.off("room_presence", handlePresence);
    };
  }, [room?.id, userId, userRole]);

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  const handleSend = async ({ text, file }: { text: string; file: File | null }) => {
    setError(null);
    if (isSending) return;
    setIsSending(true);
    try {
      const formData = new FormData();
      if (room?.id) {
        formData.append("roomId", room.id);
      }
      if (text) {
        formData.append("text", text);
      }
      if (file) {
        formData.append("image", file);
      }

      const response = await fetch("/api/chat/messages", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? "Failed to send message.");
        return;
      }
      setRoom(data.room);
      setMessages((prev) => [...prev, data.message]);
      const socket = getSocket();
      socket.emit("send_message", {
        roomId: data.room.id,
        message: data.message,
        room: data.room,
      });
    } catch (err) {
      console.error("Failed to send message", err);
      setError("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!room?.id) return;
    const socket = getSocket();
    socket.emit(isTyping ? "typing" : "stop_typing", {
      roomId: room.id,
      senderId: userId,
      senderRole: userRole,
    });
  };

  return (
    <>
      <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-8 sm:right-6">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-emerald-950 shadow-lg transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:h-16 sm:w-16"
          aria-label={isOpen ? "Close support chat" : "Open support chat"}
        >
          <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8" />
        </button>
      </div>

      <div
        className={`fixed bottom-24 right-4 z-50 w-[92vw] max-w-sm transition-all duration-300 sm:bottom-28 sm:right-6 ${
          isOpen
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div className="flex h-[70vh] max-h-[640px] flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-black/95 shadow-2xl backdrop-blur">
          <div className="border-b border-zinc-800 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
              Support chat
            </p>
            <p className="mt-1 text-sm text-zinc-400">{headerStatus}</p>
          </div>

          <div
            ref={listRef}
            onScroll={handleScroll}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
          >
            {isLoading ? (
              <p className="text-sm text-zinc-500">Loading chat…</p>
            ) : null}
            {messages.length === 0 && !isLoading ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-500">
                No messages yet. Send a message to start the chat.
              </div>
            ) : null}
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.senderId === userId}
                showSender={message.senderId !== userId}
              />
            ))}
            {adminTyping ? (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
                Admin is typing…
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          {error ? (
            <div className="border-t border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="border-t border-zinc-800 px-3 py-3">
            <MessageInput
              onSend={handleSend}
              onTyping={handleTyping}
              disabled={isSending}
              placeholder="Type your message..."
              allowUpload
            />
          </div>
        </div>
      </div>
    </>
  );
}
