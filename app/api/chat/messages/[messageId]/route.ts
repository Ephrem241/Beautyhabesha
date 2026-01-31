import { NextResponse } from "next/server";

import {
  deleteImage,
  extractPublicIdFromUrl,
} from "@/lib/cloudinary-utils";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: { messageId: string };
};

export async function DELETE(_request: Request, { params }: RouteContext) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await prisma.message.findUnique({
    where: { id: params.messageId },
  });

  if (!message) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (message.image) {
    const publicId = extractPublicIdFromUrl(message.image);
    if (publicId) {
      await deleteImage(publicId);
    }
  }

  await prisma.message.delete({ where: { id: message.id } });

  return NextResponse.json({ ok: true });
}
