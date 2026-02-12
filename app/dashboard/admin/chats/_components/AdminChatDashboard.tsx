"use client";

import Link from "next/link";
import { useSupportChat } from "@/app/support/_components/useSupportChat";
import { SupportChatPanel } from "@/app/support/_components/SupportChatPanel";

export function AdminChatDashboard({ userId }: { userId: string }) {
  const chat = useSupportChat({ userId });
  const { rooms, roomId, setRoomId, currentRoom, setResolved } = chat;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-3">
        <Link
          href="/dashboard/admin"
          className="flex items-center gap-2 text-zinc-400 transition hover:text-white"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Admin
        </Link>
        <h1 className="text-base font-semibold text-white">Support Chats</h1>
        <div className="w-9" />
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-72 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950/50">
          <div className="overflow-y-auto">
            {chat.loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            ) : rooms.length === 0 ? (
              <p className="p-6 text-center text-sm text-zinc-500">
                No conversations yet
              </p>
            ) : (
              <div className="divide-y divide-zinc-800">
                {rooms.map((room) => {
                  const isActive = room.id === roomId;
                  const hasUnread = room.unreadCount > 0;

                  return (
                    <button
                      key={room.id}
                      onClick={() => setRoomId(room.id)}
                      className={`w-full px-4 py-3 text-left transition ${
                        isActive
                          ? "bg-emerald-500/10"
                          : "hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate text-sm font-medium ${
                              isActive ? "text-emerald-300" : "text-white"
                            }`}
                          >
                            {room.user.username || room.user.name || "Anonymous"}
                          </p>
                          <p className="mt-1 truncate text-xs text-zinc-500">
                            {room.lastMessage?.text || "No messages yet"}
                          </p>
                        </div>
                        {hasUnread && (
                          <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-black">
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                      {room.resolved && (
                        <span className="mt-2 inline-block rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                          Resolved
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          {currentRoom ? (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-3">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    {currentRoom.user.username || currentRoom.user.name || "Anonymous"}
                  </h2>
                  <p className="text-xs text-zinc-500">
                    {currentRoom.user.email || "No email"}
                  </p>
                </div>
                <button
                  onClick={() => setResolved(!currentRoom.resolved)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    currentRoom.resolved
                      ? "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                      : "bg-emerald-500 text-black hover:bg-emerald-400"
                  }`}
                >
                  {currentRoom.resolved ? "Reopen" : "Mark resolved"}
                </button>
              </div>
              <SupportChatPanel
                chat={chat}
                isAdmin={true}
              />
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-zinc-500">
                Select a conversation to view messages
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

