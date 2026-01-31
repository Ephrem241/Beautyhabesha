"use client";

import Link from "next/link";
import { useSupportChat } from "@/app/support/_components/useSupportChat";
import { SupportChatPanel } from "@/app/support/_components/SupportChatPanel";

export function AdminChatDashboard({ userId }: { userId: string }) {
  const chat = useSupportChat({ userId });
  const { rooms, roomId, setRoomId, currentRoom, setResolved, fetchRooms } = chat;

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
                  const displayName =
                    room.user?.name ??
                    room.user?.username ??
                    room.user?.email ??
                    "User";
                  const isSelected = room.id === roomId;

                  return (
                    <button
                      key={room.id}
                      type="button"
                      onClick={() => setRoomId(room.id)}
                      className={`flex w-full flex-col gap-0.5 px-4 py-3 text-left transition ${
                        isSelected
                          ? "bg-zinc-800/80"
                          : "hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-white">
                          {displayName}
                        </span>
                        {room.resolved && (
                          <span className="shrink-0 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                            Resolved
                          </span>
                        )}
                      </div>
                      {room.lastMessage && (
                        <p className="truncate text-xs text-zinc-500">
                          {room.lastMessage.text ?? "Image"}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          {roomId ? (
            <>
              <div className="flex shrink-0 items-center justify-between border-b border-zinc-800 px-4 py-2">
                <span className="text-sm text-zinc-400">
                  {currentRoom?.user?.email ?? "—"}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setResolved(!currentRoom?.resolved)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      currentRoom?.resolved
                        ? "bg-zinc-700 text-zinc-400 hover:bg-zinc-600"
                        : "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                    }`}
                  >
                    {currentRoom?.resolved ? "Reopen" : "Mark resolved"}
                  </button>
                </div>
              </div>
              <SupportChatPanel chat={chat} isAdmin />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800/50">
                <svg
                  className="h-8 w-8 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
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
