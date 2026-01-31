import { NextRequest, NextResponse } from "next/server";
import { getSupportAuth } from "@/lib/support-auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const auth = await getSupportAuth(req);
  if (!auth || !auth.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { messageId } = await params;

  const message = await prisma.message.findUnique({
    where: { id: messageId },
    select: { id: true, roomId: true },
  });

  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  await prisma.message.delete({
    where: { id: messageId },
  });

  return NextResponse.json({ deleted: true });
}
