import Pusher from "pusher";
import { env } from "@/lib/env";

const pusher =
  env.PUSHER_APP_ID && env.PUSHER_KEY && env.PUSHER_SECRET
    ? new Pusher({
        appId: env.PUSHER_APP_ID,
        key: env.PUSHER_KEY,
        secret: env.PUSHER_SECRET,
        cluster: env.PUSHER_CLUSTER ?? "us2",
        useTLS: true,
      })
    : null;

export { pusher };

export function getPusherChannel(roomId: string): string {
  return `support-room-${roomId}`;
}

export function triggerMessage(roomId: string, message: unknown): boolean {
  if (!pusher) return false;
  try {
    pusher.trigger(getPusherChannel(roomId), "receive_message", message);
    return true;
  } catch {
    return false;
  }
}

export function triggerTyping(roomId: string, data: { userId: string; isTyping: boolean }): boolean {
  if (!pusher) return false;
  try {
    pusher.trigger(getPusherChannel(roomId), "typing", data);
    return true;
  } catch {
    return false;
  }
}
