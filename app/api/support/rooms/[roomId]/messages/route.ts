import { NextRequest, NextResponse } from "next/server";
import { getSupportAuth } from "@/lib/support-auth";
import { prisma } from "@/lib/db";
import { triggerMessage } from "@/lib/pusher";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const auth = await getSupportAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { roomId } = await params;

  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    select: { id: true, userId: true },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (!auth.isAdmin && room.userId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") ?? "100", 10) || 100, 200);
  const cursor = searchParams.get("cursor") ?? undefined;

  const rawTake = limit + 1;
  const rows = await prisma.message.findMany({
    where: { roomId },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: rawTake,
    cursor: cursor ? { id: cursor } : undefined,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
        },
      },
    },
  });

  const hasMore = rows.length > limit;
  const chunk = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore && chunk.length > 0 ? chunk[chunk.length - 1]!.id : null;
  const messages = [...chunk].reverse();

  return NextResponse.json({ messages, nextCursor });
}

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
  const text = typeof body.text === "string" ? body.text.trim() : null;
  const image = typeof body.image === "string" ? body.image : null;

  if (!text && !image) {
    return NextResponse.json({ error: "Text or image required" }, { status: 400 });
  }

  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    select: { id: true, userId: true },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (!auth.isAdmin && room.userId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await prisma.message.create({
    data: {
      roomId: room.id,
      senderId: auth.userId,
      text: text || null,
      image: image || null,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          username: true,
          role: true,
        },
      },
    },
  });

  await prisma.chatRoom.update({
    where: { id: room.id },
    data: { updatedAt: new Date() },
  });

  triggerMessage(roomId, message);

  return NextResponse.json({ message });
}
