"use client";

import { useState } from "react";
import ReviewModal from "./ReviewModal";

type Escort = {
  id: string;
  displayName: string;
  city?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
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

  if (escorts.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-400">
        No escorts found.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Location
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Plan
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {escorts.map((escort) => (
              <tr
                key={escort.id}
                className="cursor-pointer hover:bg-zinc-900/50"
                onClick={() => setSelectedEscort(escort)}
              >
                <td className="px-6 py-4 text-sm text-zinc-200">{escort.displayName}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">
                  {escort.city || "—"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(
                      escort.status
                    )}`}
                  >
                    {escort.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">
                  {escort.plan}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">
                  {new Date(escort.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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