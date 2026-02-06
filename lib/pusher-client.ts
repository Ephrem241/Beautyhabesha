"use client";

import Pusher from "pusher-js";

let pusherClient: Pusher | null = null;

/**
 * Get Pusher client instance with private channel authorization
 * Configured to use /api/pusher/auth endpoint for secure channel access
 */
export function getPusherClient(): Pusher | null {
  if (typeof window === "undefined") return null;
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? "us2";
  if (!key) return null;
  if (!pusherClient) {
    pusherClient = new Pusher(key, {
      cluster,
      authEndpoint: "/api/pusher/auth", // Server-side authorization for private channels
      auth: {
        headers: {
          // CSRF token will be included automatically by Next.js
        },
      },
    });
  }
  return pusherClient;
}

/**
 * Get support channel name (private channel)
 * Requires authorization via /api/pusher/auth
 */
export function getSupportChannel(roomId: string) {
  return `private-support-room-${roomId}`;
}
