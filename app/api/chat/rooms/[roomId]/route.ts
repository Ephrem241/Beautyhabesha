import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: { roomId: string };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin" && session.user.role !== "user") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const roomId = params.roomId;
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
        },
      },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin = session.user.role === "admin";
  if (!isAdmin && room.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { roomId },
    orderBy: { createdAt: "asc" },
    include: {
      sender: {
        select: {
          id: true,
          role: true,
          name: true,
          username: true,
          email: true,
        },
      },
    },
  });

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
    },
    messages: messages.map((message) => ({
      id: message.id,
      roomId: message.roomId,
      senderId: message.senderId,
      text: message.text,
      image: message.image,
      createdAt: message.createdAt.toISOString(),
      sender: {
        id: message.sender.id,
        role: message.sender.role,
        name: message.sender.name,
        username: message.sender.username,
        email: message.sender.email,
      },
    })),
  });
}
