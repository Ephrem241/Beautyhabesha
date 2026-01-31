import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  const userId = session.user.id;

  if (role !== "admin" && role !== "user") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (role === "admin") {
    const rooms = await prisma.chatRoom.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    const formattedRooms = rooms.map((room) => ({
      id: room.id,
      userId: room.userId,
      resolved: room.resolved,
      createdAt: room.createdAt.toISOString(),
      messageCount: room._count.messages,
      user: {
        id: room.user.id,
        name: room.user.name,
        username: room.user.username,
        email: room.user.email,
      },
      lastMessage: room.messages[0]
        ? {
            id: room.messages[0].id,
            text: room.messages[0].text,
            image: room.messages[0].image,
            createdAt: room.messages[0].createdAt.toISOString(),
            senderId: room.messages[0].senderId,
          }
        : null,
    }));

    return NextResponse.json({ rooms: formattedRooms });
  }

  const room = await prisma.chatRoom.findUnique({
    where: { userId },
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
    },
  });

  if (!room) {
    return NextResponse.json({ room: null });
  }

  return NextResponse.json({
    room: {
      id: room.id,
      userId: room.userId,
      resolved: room.resolved,
      createdAt: room.createdAt.toISOString(),
      user: {
        id: room.user.id,
        name: room.user.name,
        username: room.user.username,
        email: room.user.email,
      },
      lastMessage: room.messages[0]
        ? {
            id: room.messages[0].id,
            text: room.messages[0].text,
            image: room.messages[0].image,
            createdAt: room.messages[0].createdAt.toISOString(),
            senderId: room.messages[0].senderId,
          }
        : null,
    },
  });
}
