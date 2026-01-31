import { redirect } from "next/navigation";

import { ChatWidget } from "@/app/_components/chat/ChatWidget";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import type { ChatMessage, ChatRoomSummary } from "@/types/chat";

export default async function SupportPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }
  if (session.user.role !== "user") {
    redirect("/");
  }

  const room = await prisma.chatRoom.findUnique({
    where: { userId: session.user.id },
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
              role: true,
              name: true,
              username: true,
              email: true,
            },
          },
        },
      },
    },
  });

  const initialRoom: ChatRoomSummary | null = room
    ? {
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
        lastMessage: room.messages.length
          ? {
              id: room.messages[room.messages.length - 1].id,
              text: room.messages[room.messages.length - 1].text,
              image: room.messages[room.messages.length - 1].image,
              createdAt: room.messages[room.messages.length - 1].createdAt.toISOString(),
              senderId: room.messages[room.messages.length - 1].senderId,
            }
          : null,
      }
    : null;

  const initialMessages: ChatMessage[] = room
    ? room.messages.map((message) => ({
        id: message.id,
        roomId: message.roomId,
        senderId: message.senderId,
        text: message.text,
        image: message.image,
        createdAt: message.createdAt.toISOString(),
        sender: {
          id: message.sender.id,
          role: message.sender.role as "admin" | "user" | "escort",
          name: message.sender.name,
          username: message.sender.username,
          email: message.sender.email,
        },
      }))
    : [];

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          Support & Payment Help
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          Chat with our admin team in real time. Share payment screenshots or ask
          for help with your subscription.
        </p>
      </div>
      <ChatWidget
        userId={session.user.id}
        userRole={session.user.role}
        initialRoom={initialRoom}
        initialMessages={initialMessages}
      />
    </main>
  );
}
