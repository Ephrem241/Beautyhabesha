import { NextRequest, NextResponse } from "next/server";
import { getSupportAuth } from "@/lib/support-auth";
import { prisma } from "@/lib/db";
import { triggerTyping } from "@/lib/pusher";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const auth = await getSupportAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await params;
  const body = await req.json().catch(() => ({}));
  const isTyping = Boolean(body.isTyping);

  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    select: { userId: true },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (!auth.isAdmin && room.userId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  triggerTyping(roomId, { userId: auth.userId, isTyping });

  return NextResponse.json({ ok: true });
}
