"use client";

import { useState } from "react";
import { ProfileAvatar } from "@/app/_components/ProfileAvatar";
import ReviewModal from "./ReviewModal";

type Escort = {
  id: string;
  displayName: string;
  city?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  hasImage: boolean;
  profileImageUrl: string | null;
  plan: string;
  createdAt: string;
  userId: string;
  userName: string;
};

type EscortsTableProps = {
  escorts: Escort[];
};

export default function EscortsTable({ escorts }: EscortsTableProps) {
  const [selectedEscort, setSelectedEscort] = useState<Escort | null>(null);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      case "suspended":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
      default:
        return "bg-zinc-500/20 text-zinc-300 border-zinc-500/40";
    }
  };

  const renderRow = (escort: Escort) => (
    <tr
      key={escort.id}
      className="cursor-pointer hover:bg-zinc-900/50"
      onClick={() => setSelectedEscort(escort)}
    >
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <ProfileAvatar
            src={escort.profileImageUrl}
            alt={escort.displayName}
            size={36}
            className="shrink-0"
          />
          <span className="text-sm text-zinc-200">{escort.displayName}</span>
        </div>
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
            escort.hasImage
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/40 bg-amber-500/10 text-amber-300"
          }`}
          title={escort.hasImage ? "Has profile picture" : "No picture — add before approve"}
        >
          {escort.hasImage ? "✓ Yes" : "No"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6 sm:py-4">
        {escort.city || "—"}
      </td>
      <td className="px-4 py-3 sm:px-6 sm:py-4">
        <span
          className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(
            escort.status
          )}`}
        >
          {escort.status}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6 sm:py-4">
        {escort.plan}
      </td>
      <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6 sm:py-4">
        {new Date(escort.createdAt).toLocaleDateString()}
      </td>
    </tr>
  );

  if (escorts.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-400">
        No escorts found.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[520px]">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Photo
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Location
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {escorts.map((escort) => renderRow(escort))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 p-4 md:hidden">
          {escorts.map((escort) => (
            <button
              type="button"
              key={escort.id}
              onClick={() => setSelectedEscort(escort)}
              className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-black p-4 text-left transition hover:border-zinc-700 hover:bg-zinc-900/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <ProfileAvatar
                    src={escort.profileImageUrl}
                    alt={escort.displayName}
                    size={40}
                    className="shrink-0"
                  />
                  <span className="font-medium text-zinc-200 truncate">{escort.displayName}</span>
                </div>
                <span
                  className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(
                    escort.status
                  )}`}
                >
                  {escort.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                <span className={escort.hasImage ? "text-emerald-400" : "text-amber-400"}>
                  {escort.hasImage ? "✓ Photo" : "No photo"}
                </span>
                <span>{escort.city || "—"}</span>
                <span>{escort.plan}</span>
                <span>{new Date(escort.createdAt).toLocaleDateString()}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedEscort && (
        <ReviewModal
          escort={selectedEscort}
          onClose={() => setSelectedEscort(null)}
        />
      )}
    </>
  );
}