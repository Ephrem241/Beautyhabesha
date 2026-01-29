"use client";

type Booking = {
  id: string;
  userName: string;
  userEmail: string;
  escortName: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: string;
  status: string;
  depositAmount: number;
  createdAt: string;
  depositPayments: Array<{
    id: string;
    status: string;
    receiptUrl: string;
  }>;
};

type BookingsTableProps = {
  bookings: Booking[];
};

const statusClass: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-300",
  approved: "bg-emerald-500/20 text-emerald-300",
  rejected: "bg-red-500/20 text-red-300",
  completed: "bg-zinc-500/20 text-zinc-300",
  canceled: "bg-zinc-600/20 text-zinc-400",
};

export default function BookingsTable({ bookings }: BookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-400">
        No bookings yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                User / Escort
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Date & time
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Mode
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Deposit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-zinc-900/50">
                <td className="px-4 py-3 text-sm">
                  <p className="text-zinc-200">{b.userName}</p>
                  <p className="text-xs text-zinc-500">{b.userEmail}</p>
                  <p className="mt-1 text-xs text-zinc-400">→ {b.escortName}</p>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  {b.date} {b.startTime}–{b.endTime}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{b.mode}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusClass[b.status] ?? "bg-zinc-600 text-zinc-400"
                    }`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  ETB {b.depositAmount}
                  {b.depositPayments.length > 0 && (
                    <span className="ml-1 text-xs">
                      ({b.depositPayments[0].status})
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
