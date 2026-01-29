"use client";

import { useTransition } from "react";
import {
  escortAcceptBooking,
  escortRejectBooking,
  escortCompleteBooking,
} from "@/app/booking/actions";

type BookingItem = {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  mode: string;
  status: string;
  escortAcceptedAt: Date | null;
  user: { id: string; email: string | null; username: string | null; name: string | null };
};

type EscortBookingsSectionProps = {
  bookings: BookingItem[];
};

const statusBadge: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300 border-amber-500/40",
  approved: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
  rejected: "bg-red-500/20 text-red-300 border-red-500/40",
  completed: "bg-zinc-500/20 text-zinc-300 border-zinc-500/40",
  canceled: "bg-zinc-600/20 text-zinc-400 border-zinc-600/40",
};

export function EscortBookingsSection({ bookings }: EscortBookingsSectionProps) {
  const [pending, startTransition] = useTransition();

  const handleAccept = (bookingId: string) => {
    startTransition(async () => {
      await escortAcceptBooking(bookingId);
      window.location.reload();
    });
  };

  const handleReject = (bookingId: string) => {
    startTransition(async () => {
      await escortRejectBooking(bookingId);
      window.location.reload();
    });
  };

  const handleComplete = (bookingId: string) => {
    startTransition(async () => {
      await escortCompleteBooking(bookingId);
      window.location.reload();
    });
  };

  const upcoming = bookings.filter(
    (b) =>
      b.status === "pending" ||
      b.status === "approved" ||
      (b.status === "completed" && new Date(b.date) >= new Date(new Date().toDateString()))
  );

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Upcoming bookings
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Accept, reject, or mark bookings as completed. Client contact is visible once deposit is approved.
      </p>
      <ul className="mt-4 space-y-3">
        {upcoming.slice(0, 15).map((b) => (
          <li
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-black/40 px-4 py-3"
          >
            <div>
              <p className="font-medium text-zinc-200">
                {new Date(b.date).toLocaleDateString()} · {b.startTime}–{b.endTime} · {b.mode}
              </p>
              {b.status === "approved" || b.status === "completed" ? (
                <p className="text-sm text-zinc-400">
                  {b.user.name ?? "Client"} ({b.user.email ?? b.user.username ?? "—"})
                </p>
              ) : (
                <p className="text-sm text-zinc-500">Client (contact after approval)</p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                  statusBadge[b.status] ?? "bg-zinc-600 text-zinc-400"
                }`}
              >
                {b.status}
              </span>
              {b.status === "approved" && (
                <>
                  {!b.escortAcceptedAt && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAccept(b.id)}
                        disabled={pending}
                        className="rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(b.id)}
                        disabled={pending}
                        className="rounded-lg border border-red-500/50 bg-red-500/10 px-2 py-1 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {b.escortAcceptedAt && (
                    <button
                      type="button"
                      onClick={() => handleComplete(b.id)}
                      disabled={pending}
                      className="rounded-lg bg-zinc-600 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-500 disabled:opacity-50"
                    >
                      Mark completed
                    </button>
                  )}
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
