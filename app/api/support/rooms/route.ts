import { NextRequest, NextResponse } from "next/server";
import { getSupportAuth } from "@/lib/support-auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await getSupportAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const where = auth.isAdmin ? {} : { userId: auth.userId };

  const rooms = await prisma.chatRoom.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          id: true,
          text: true,
          image: true,
          createdAt: true,
          senderId: true,
        },
      },
      _count: { select: { messages: true } },
    },
  });

  const withUnread = rooms.map((r) => {
    const lastMsg = r.messages[0];
    return {
      id: r.id,
      userId: r.userId,
      resolved: r.resolved,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      user: r.user,
      lastMessage: lastMsg
        ? {
            id: lastMsg.id,
            text: lastMsg.text,
            image: lastMsg.image,
            createdAt: lastMsg.createdAt,
            senderId: lastMsg.senderId,
          }
        : null,
      messageCount: r._count.messages,
      unreadCount: auth.isAdmin
        ? 0
        : 0, // Could add read tracking later
    };
  });

  return NextResponse.json({ rooms: withUnread });
}

export async function POST(req: NextRequest) {
  const auth = await getSupportAuth(req);
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await prisma.chatRoom.findFirst({
    where: { userId: auth.userId },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json({ roomId: existing.id });
  }

  const room = await prisma.chatRoom.create({
    data: { userId: auth.userId },
  });

  return NextResponse.json({ roomId: room.id });
}
