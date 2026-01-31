"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { getPusherClient, getSupportChannel } from "@/lib/pusher-client";

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  text: string | null;
  image: string | null;
  createdAt: string;
  sender: {
    id: string;
    name: string | null;
    username: string | null;
    role: string;
  };
};

export type ChatRoom = {
  id: string;
  userId: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    username: string | null;
    email: string | null;
  };
  lastMessage: {
    id: string;
    text: string | null;
    image: string | null;
    createdAt: string;
    senderId: string;
  } | null;
  messageCount: number;
  unreadCount: number;
};

type UseSupportChatOptions = {
  userId: string;
  initialRoomId?: string | null;
};

export function useSupportChat({ userId, initialRoomId }: UseSupportChatOptions) {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomId, setRoomId] = useState<string | null>(initialRoomId ?? null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState<string | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/support/rooms", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setRooms(data.rooms ?? []);
      if (!roomId && data.rooms?.length) {
        setRoomId(data.rooms[0].id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  const fetchMessages = useCallback(async (rId: string) => {
    try {
      const res = await fetch(`/api/support/rooms/${rId}/messages`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(data.messages ?? []);
    } catch {
      // ignore
    }
  }, []);

  const ensureRoom = useCallback(async (): Promise<string | null> => {
    let rId = roomId;
    if (!rId && rooms.length) {
      rId = rooms[0].id;
      setRoomId(rId);
    }
    if (!rId) {
      const res = await fetch("/api/support/rooms", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      rId = data.roomId;
      setRoomId(rId);
      await fetchRooms();
    }
    return rId;
  }, [roomId, rooms, fetchRooms]);

  const sendMessage = useCallback(
    async (text: string, imageUrl?: string) => {
      const rId = await ensureRoom();
      if (!rId) return;
      setSending(true);
      try {
        const res = await fetch(`/api/support/rooms/${rId}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: text || undefined,
            image: imageUrl,
          }),
          credentials: "include",
        });
        const data = await res.json();
        if (data.message) {
          setMessages((prev) => [...prev, data.message]);
          fetchRooms();
        }
      } catch {
        // ignore
      } finally {
        setSending(false);
      }
    },
    [ensureRoom, fetchRooms]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!roomId) return;
      fetch(`/api/support/rooms/${roomId}/typing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTyping }),
        credentials: "include",
      }).catch(() => {});
    },
    [roomId]
  );

  const deleteMessage = useCallback(
    async (messageId: string) => {
      try {
        const res = await fetch(`/api/support/messages/${messageId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) {
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
        }
      } catch {
        // ignore
      }
    },
    []
  );

  const setResolved = useCallback(
    async (resolved: boolean) => {
      if (!roomId) return;
      try {
        const res = await fetch(`/api/support/rooms/${roomId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resolved }),
          credentials: "include",
        });
        if (res.ok) {
          await fetchRooms();
        }
      } catch {
        // ignore
      }
    },
    [roomId, fetchRooms]
  );

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    if (roomId) {
      fetchMessages(roomId);
    } else {
      setMessages([]);
    }
  }, [roomId, fetchMessages]);

  useEffect(() => {
    if (!roomId) return;
    const client = getPusherClient();
    if (!client) return;
    const channel = client.subscribe(getSupportChannel(roomId));
    channel.bind("receive_message", (msg: ChatMessage) => {
      if (msg.roomId === roomId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      }
      fetchRooms();
    });
    channel.bind("typing", (data: { userId: string; isTyping: boolean }) => {
      if (data.userId === userId) return;
      setTyping(data.isTyping ? data.userId : null);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      if (data.isTyping) {
        typingTimeout.current = setTimeout(() => setTyping(null), 3000);
      }
    });
    return () => {
      channel.unbind_all();
      client.unsubscribe(getSupportChannel(roomId));
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [roomId, userId, fetchRooms]);

  const currentRoom = rooms.find((r) => r.id === roomId);

  return {
    userId,
    rooms,
    messages,
    roomId,
    setRoomId,
    currentRoom,
    loading,
    sending,
    typing,
    sendMessage,
    sendTyping,
    deleteMessage,
    setResolved,
    fetchRooms,
    ensureRoom,
  };
}
