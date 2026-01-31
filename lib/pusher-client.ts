"use client";

import Pusher from "pusher-js";

let pusherClient: Pusher | null = null;

export function getPusherClient(): Pusher | null {
  if (typeof window === "undefined") return null;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "us2";
  if (!key) return null;
  if (!pusherClient) {
    pusherClient = new Pusher(key, {
      cluster,
    });
  }
  return pusherClient;
}

export function getSupportChannel(roomId: string) {
  return `support-room-${roomId}`;
}
