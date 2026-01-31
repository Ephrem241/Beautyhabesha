import { redirect } from "next/navigation";

import AdminChatDashboard from "./AdminChatDashboard";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ChatRoomSummary } from "@/types/chat";

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
  return session;
}

export default async function AdminChatsPage() {
  const session = await requireAdmin();
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

  const initialRooms: ChatRoomSummary[] = rooms.map((room) => ({
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

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Admin dashboard
          </p>
          <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">
            Support chats
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Respond to users, review payment proofs, and resolve conversations.
          </p>
        </header>

        <AdminChatDashboard
          adminId={session.user.id}
          initialRooms={initialRooms}
        />
      </div>
    </main>
  );
}
