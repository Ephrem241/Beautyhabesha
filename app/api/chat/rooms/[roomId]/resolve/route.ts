import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: { roomId: string };
};

export async function PATCH(request: Request, { params }: RouteContext) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = (await request.json()) as { resolved?: boolean };
  if (typeof body.resolved !== "boolean") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const updated = await prisma.chatRoom.update({
    where: { id: params.roomId },
    data: { resolved: body.resolved },
  });

  return NextResponse.json({
    room: {
      id: updated.id,
      userId: updated.userId,
      resolved: updated.resolved,
      createdAt: updated.createdAt.toISOString(),
    },
  });
}
