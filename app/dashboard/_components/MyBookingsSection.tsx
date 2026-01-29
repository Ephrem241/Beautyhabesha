"use client";

import Link from "next/link";

type BookingItem = {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  mode: string;
  status: string;
  depositAmount: number;
  escortProfile: { id: string; displayName: string };
  depositPayments: Array<{ status: string }>;
};

type MyBookingsSectionProps = {
  bookings: BookingItem[];
};

const statusBadge: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  rejected: "bg-red-500/20 text-red-300 border-red-500/40",
  completed: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
  canceled: "bg-zinc-600/20 text-zinc-400 border-zinc-600/40",
};

export function MyBookingsSection({ bookings }: MyBookingsSectionProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        My bookings
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Track your booking requests and deposit status.
      </p>
      <ul className="mt-4 space-y-3">
        {bookings.slice(0, 10).map((b) => {
          const deposit = b.depositPayments[0];
          const depositStatus = deposit?.status ?? null;
          const canPayDeposit = b.status === "pending" && depositStatus !== "pending";
          return (
            <li
              key={b.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-zinc-800 bg-black/40 px-4 py-3"
            >
              <div>
                <p className="font-medium text-zinc-200">
                  {b.escortProfile.displayName}
                </p>
                <p className="text-xs text-zinc-500">
                  {new Date(b.date).toLocaleDateString()} · {b.startTime}–{b.endTime} · {b.mode}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                    statusBadge[b.status] ?? "bg-zinc-600 text-zinc-400"
                  }`}
                >
                  {b.status}
                </span>
                {canPayDeposit && (
                  <Link
                    href={`/dashboard/bookings/${b.id}/pay`}
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    Pay deposit
                  </Link>
                )}
                {b.status === "pending" && depositStatus === "pending" && (
                  <span className="text-xs text-amber-300">Deposit pending review</span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
