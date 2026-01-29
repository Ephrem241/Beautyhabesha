import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { getBookingsForAdmin, getPendingDepositsForAdmin } from "@/lib/booking";
import BookingsTable from "./_components/BookingsTable";
import PendingDepositsPanel from "./_components/PendingDepositsPanel";

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminBookingsPage() {
  await requireAdmin();

  const [bookings, pendingDeposits] = await Promise.all([
    getBookingsForAdmin(),
    getPendingDepositsForAdmin(),
  ]);

  const formattedBookings = bookings.map((b) => ({
    id: b.id,
    userId: b.userId,
    escortId: b.escortId,
    userName: b.user.name ?? b.user.email,
    userEmail: b.user.email,
    escortName: b.escortProfile.displayName,
    date: b.date.toISOString().slice(0, 10),
    startTime: b.startTime,
    endTime: b.endTime,
    mode: b.mode,
    status: b.status,
    depositAmount: b.depositAmount,
    createdAt: b.createdAt.toISOString(),
    depositPayments: b.depositPayments.map((d) => ({
      id: d.id,
      amount: d.amount,
      paymentMethod: d.paymentMethod,
      receiptUrl: d.receiptUrl,
      status: d.status,
      createdAt: d.createdAt.toISOString(),
    })),
  }));

  const formattedDeposits = pendingDeposits.map((d) => ({
    id: d.id,
    bookingId: d.bookingId,
    amount: d.amount,
    paymentMethod: d.paymentMethod,
    receiptUrl: d.receiptUrl,
    userName: d.booking.user.name ?? d.booking.user.email,
    userEmail: d.booking.user.email,
    escortName: d.booking.escortProfile.displayName,
    date: d.booking.date.toISOString().slice(0, 10),
    startTime: d.booking.startTime,
    endTime: d.booking.endTime,
    createdAt: d.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Admin dashboard
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Bookings & deposits
          </h1>
          <p className="text-sm text-zinc-400">
            Approve or reject deposit payments. View all bookings.
          </p>
        </header>

        {formattedDeposits.length > 0 && (
          <PendingDepositsPanel deposits={formattedDeposits} />
        )}

        <div className="mt-8">
          <BookingsTable bookings={formattedBookings} />
        </div>
      </div>
    </main>
  );
}
