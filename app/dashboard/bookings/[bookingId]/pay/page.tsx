import { notFound } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { getBookingById } from "@/lib/booking";
import { DepositForm } from "./_components/DepositForm";

type PageProps = {
  params: Promise<{ bookingId: string }>;
};

export default async function PayDepositPage({ params }: PageProps) {
  const { bookingId } = await params;
  const session = await getAuthSession();
  const userId = session?.user?.id ?? null;

  if (!userId) {
    notFound();
  }

  const booking = await getBookingById(bookingId, userId);
  if (!booking || booking.userId !== userId || booking.status !== "pending") {
    notFound();
  }

  const hasPendingDeposit = booking.depositPayments.some((d) => d.status === "pending");
  if (hasPendingDeposit) {
    return (
      <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-6 sm:py-16">
        <div className="mx-auto max-w-md">
          <p className="text-sm text-amber-300">
            You already submitted a deposit for this booking. We will notify you once it is reviewed.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-md">
        <h1 className="text-xl font-semibold sm:text-2xl">Pay deposit</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Booking with {booking.escortProfile.displayName} ·{" "}
          {new Date(booking.date).toLocaleDateString()} {booking.startTime}–{booking.endTime}
        </p>
        <DepositForm
          bookingId={booking.id}
          amount={booking.depositAmount}
          escortName={booking.escortProfile.displayName}
        />
      </div>
    </main>
  );
}
