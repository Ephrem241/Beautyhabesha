import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary-utils";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "admin" && role !== "user") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const roomIdRaw = formData.get("roomId");
  const textRaw = formData.get("text");
  const imageFile = formData.get("image");

  const roomId = typeof roomIdRaw === "string" ? roomIdRaw : null;
  const text = typeof textRaw === "string" ? textRaw.trim() : "";
  const file = imageFile instanceof File ? imageFile : null;

  if (!text && !file) {
    return NextResponse.json(
      { error: "Message must include text or image." },
      { status: 400 }
    );
  }

  let room = roomId
    ? await prisma.chatRoom.findUnique({
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
      })
    : null;

  if (!room) {
    if (role === "admin") {
      return NextResponse.json(
        { error: "Room is required for admin messages." },
        { status: 400 }
      );
    }
    room = await prisma.chatRoom.create({
      data: { userId: session.user.id },
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
  }

  if (role !== "admin" && room.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (role === "user" && room.resolved) {
    room = await prisma.chatRoom.update({
      where: { id: room.id },
      data: { resolved: false },
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
  }

  let imageUrl: string | null = null;
  if (file) {
    const upload = await uploadImage(file, {
      folder: "support-chat",
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 80,
      format: "auto",
    });
    if (!upload.success || !upload.image?.url) {
      return NextResponse.json(
        { error: upload.error ?? "Failed to upload image." },
        { status: 500 }
      );
    }
    imageUrl = upload.image.url;
  }

  const message = await prisma.message.create({
    data: {
      roomId: room.id,
      senderId: session.user.id,
      text: text || null,
      image: imageUrl,
    },
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
    message: {
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
    },
  });
}
