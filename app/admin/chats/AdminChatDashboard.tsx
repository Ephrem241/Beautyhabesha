"use client";

import { CheckCircle, Circle, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { getSocket } from "@/lib/socket-client";
import type { ChatMessage, ChatRoomSummary } from "@/types/chat";

import { MessageBubble } from "@/app/_components/chat/MessageBubble";
import { MessageInput } from "@/app/_components/chat/MessageInput";

type AdminChatDashboardProps = {
  adminId: string;
  initialRooms: ChatRoomSummary[];
};

type SocketMessagePayload = {
  roomId: string;
  message: ChatMessage;
  room?: ChatRoomSummary;
};

type PresencePayload = {
  roomId: string;
  userOnline: boolean;
  adminOnline: boolean;
};

type TypingPayload = {
  roomId: string;
  senderId: string;
  senderRole?: "admin" | "user" | "escort";
};

export default function AdminChatDashboard({
  adminId,
  initialRooms,
}: AdminChatDashboardProps) {
  const [rooms, setRooms] = useState<ChatRoomSummary[]>(initialRooms);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(
    initialRooms[0]?.id ?? null
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [typingUser, setTypingUser] = useState(false);
  const [onlineByRoom, setOnlineByRoom] = useState<Record<string, boolean>>({});
  const [unreadByRoom, setUnreadByRoom] = useState<Record<string, number>>({});
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeRoom = useMemo(
    () => rooms.find((room) => room.id === activeRoomId) ?? null,
    [rooms, activeRoomId]
  );

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const atBottom = scrollHeight - scrollTop - clientHeight < 80;
    setShouldAutoScroll(atBottom);
  };

  const loadRooms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/chat/rooms", { cache: "no-store" });
      const data = await response.json();
      if (response.ok && data.rooms) {
        setRooms(data.rooms);
        if (!activeRoomId && data.rooms.length > 0) {
          setActiveRoomId(data.rooms[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load rooms", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat/rooms/${roomId}`, {
        cache: "no-store",
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(data.messages ?? []);
        setShouldAutoScroll(true);
      }
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    socket.emit("join_room", { roomId: "admin", role: "admin", userId: adminId });

    const handleReceive = (payload: SocketMessagePayload) => {
      setRooms((prev) => {
        const existing = prev.find((room) => room.id === payload.roomId);
        const roomData = payload.room
          ? { ...existing, ...payload.room }
          : existing;
        if (!roomData) return prev;
        const updatedRoom: ChatRoomSummary = {
          ...roomData,
          lastMessage: {
            id: payload.message.id,
            text: payload.message.text,
            image: payload.message.image,
            createdAt: payload.message.createdAt,
            senderId: payload.message.senderId,
          },
        };
        const filtered = prev.filter((room) => room.id !== payload.roomId);
        return [updatedRoom, ...filtered];
      });

      if (payload.roomId === activeRoomId) {
        setMessages((prev) =>
          prev.some((message) => message.id === payload.message.id)
            ? prev
            : [...prev, payload.message]
        );
      } else {
        setUnreadByRoom((prev) => ({
          ...prev,
          [payload.roomId]: (prev[payload.roomId] ?? 0) + 1,
        }));
      }
    };

    const handlePresence = (payload: PresencePayload) => {
      setOnlineByRoom((prev) => ({
        ...prev,
        [payload.roomId]: payload.userOnline,
      }));
    };

    const handleTyping = (payload: TypingPayload) => {
      if (payload.roomId !== activeRoomId) return;
      if (payload.senderRole === "admin") return;
      setTypingUser(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => setTypingUser(false), 1200);
    };

    const handleStopTyping = (payload: TypingPayload) => {
      if (payload.roomId !== activeRoomId) return;
      setTypingUser(false);
    };

    socket.on("receive_message", handleReceive);
    socket.on("room_presence", handlePresence);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("room_presence", handlePresence);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };
  }, [activeRoomId, adminId]);

  useEffect(() => {
    if (activeRoomId) {
      void loadMessages(activeRoomId);
      const socket = getSocket();
      socket.emit("join_room", {
        roomId: activeRoomId,
        role: "admin",
        userId: adminId,
      });
      setUnreadByRoom((prev) => ({ ...prev, [activeRoomId]: 0 }));
    }
  }, [activeRoomId, adminId]);

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  const handleSend = async ({ text, file }: { text: string; file: File | null }) => {
    if (!activeRoomId || isSending) return;
    setIsSending(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("roomId", activeRoomId);
      if (text) formData.append("text", text);
      if (file) formData.append("image", file);

      const response = await fetch("/api/chat/messages", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data?.error ?? "Failed to send message.");
        return;
      }
      setMessages((prev) => [...prev, data.message]);
      setRooms((prev) => {
        const filtered = prev.filter((room) => room.id !== data.room.id);
        return [data.room, ...filtered];
      });
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
    if (!activeRoomId) return;
    const socket = getSocket();
    socket.emit(isTyping ? "typing" : "stop_typing", {
      roomId: activeRoomId,
      senderId: adminId,
      senderRole: "admin",
    });
  };

  const handleResolve = async () => {
    if (!activeRoomId || !activeRoom) return;
    const nextResolved = !activeRoom.resolved;
    const response = await fetch(`/api/chat/rooms/${activeRoomId}/resolve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: nextResolved }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data?.error ?? "Failed to update room.");
      return;
    }
    setRooms((prev) =>
      prev.map((room) =>
        room.id === activeRoomId ? { ...room, resolved: data.room.resolved } : room
      )
    );
  };

  const handleDeleteMessage = async (messageId: string) => {
    const response = await fetch(`/api/chat/messages/${messageId}`, {
      method: "DELETE",
    });
    if (!response.ok) return;
    setMessages((prev) => prev.filter((message) => message.id !== messageId));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
              Conversations
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              {rooms.length} active chats
            </p>
          </div>
          <button
            type="button"
            onClick={loadRooms}
            className="flex items-center gap-2 rounded-full border border-zinc-800 px-3 py-2 text-xs uppercase tracking-[0.3em] text-zinc-300 transition hover:border-emerald-400 hover:text-emerald-200"
            aria-label="Refresh rooms"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {rooms.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">
              No support chats yet.
            </div>
          ) : null}
          {rooms.map((room) => {
            const label =
              room.user.name ?? room.user.username ?? room.user.email ?? "User";
            const isActive = room.id === activeRoomId;
            const unread = unreadByRoom[room.id] ?? 0;
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => setActiveRoomId(room.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? "border-emerald-400 bg-emerald-500/10"
                    : "border-zinc-800 bg-black hover:border-emerald-500/40"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        onlineByRoom[room.id] ? "bg-emerald-400" : "bg-zinc-700"
                      }`}
                    />
                    <span className="text-sm font-semibold text-white">
                      {label}
                    </span>
                  </div>
                  {unread > 0 ? (
                    <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-xs font-semibold text-emerald-950">
                      {unread}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-1 text-xs text-zinc-400">
                  {room.lastMessage?.text ??
                    (room.lastMessage?.image ? "📷 Image attached" : "No messages yet")}
                </p>
                <div className="mt-3 flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-zinc-500">
                  {room.resolved ? (
                    <span className="flex items-center gap-1 text-emerald-300">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Resolved
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-300">
                      <Circle className="h-3.5 w-3.5" />
                      Open
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex min-h-[70vh] flex-col rounded-3xl border border-zinc-800 bg-black">
        <div className="flex items-start justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
              Active chat
            </p>
            <p className="mt-2 text-sm text-zinc-400">
              {activeRoom
                ? activeRoom.user.name ??
                  activeRoom.user.username ??
                  activeRoom.user.email ??
                  "User"
                : "Select a conversation"}
            </p>
          </div>
          {activeRoom ? (
            <button
              type="button"
              onClick={handleResolve}
              className="rounded-full border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.3em] text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-200"
            >
              {activeRoom.resolved ? "Reopen" : "Mark resolved"}
            </button>
          ) : null}
        </div>

        <div
          ref={listRef}
          onScroll={handleScroll}
          className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
        >
          {isLoading ? (
            <p className="text-sm text-zinc-500">Loading messages…</p>
          ) : null}
          {messages.length === 0 && !isLoading ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-4 text-sm text-zinc-500">
              No messages in this chat yet.
            </div>
          ) : null}
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.senderId === adminId}
              showSender={message.senderId !== adminId}
              canDelete
              onDelete={handleDeleteMessage}
            />
          ))}
          {typingUser ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
              User is typing…
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>

        {error ? (
          <div className="border-t border-rose-500/40 bg-rose-500/10 px-4 py-2 text-xs text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="border-t border-zinc-800 px-4 py-4">
          <MessageInput
            onSend={handleSend}
            onTyping={handleTyping}
            disabled={!activeRoomId || isSending}
            placeholder="Reply to this user..."
            allowUpload
          />
        </div>
      </section>
    </div>
  );
}
