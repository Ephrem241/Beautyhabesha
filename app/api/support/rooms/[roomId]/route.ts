import { NextRequest, NextResponse } from "next/server";
import { getSupportAuth } from "@/lib/support-auth";
import { prisma } from "@/lib/db";

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
        orderBy: { createdAt: "asc" },
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
      },
    },
  });

  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  if (!auth.isAdmin && room.userId !== auth.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ room });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const auth = await getSupportAuth(req);
  if (!auth || !auth.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { roomId } = await params;
  const body = await req.json().catch(() => ({}));
  const resolved = body.resolved;

  if (typeof resolved !== "boolean") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const room = await prisma.chatRoom.update({
    where: { id: roomId },
    data: { resolved },
  });

  return NextResponse.json({ room });
}
