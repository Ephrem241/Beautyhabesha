import { redirect } from "next/navigation";
import Link from "next/link";

import { getAuthSession, checkUserNotBanned } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasEscortConsentComplete } from "@/lib/consent";
import { getAvailabilityForEscort } from "@/lib/availability";
import { AvailabilityCalendar } from "./_components/AvailabilityCalendar";

async function requireEscort() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "escort") {
    redirect("/");
  }
  return session.user.id;
}

export default async function EscortAvailabilityPage() {
  const userId = await requireEscort();
  await checkUserNotBanned(userId);

  if (!(await hasEscortConsentComplete(userId))) redirect("/consent");

  const profile = await prisma.escortProfile.findUnique({
    where: { userId },
    select: { id: true, displayName: true },
  });

  if (!profile) {
    redirect("/escort/profile");
  }

  const fromDate = new Date();
  fromDate.setHours(0, 0, 0, 0);
  const toDate = new Date(fromDate.getTime() + 90 * 24 * 60 * 60 * 1000);
  const slots = await getAvailabilityForEscort(profile.id, {
    fromDate,
    toDate,
  });

  const serialized = slots.map((s) => ({
    id: s.id,
    date: s.date.toISOString().slice(0, 10),
    startTime: s.startTime,
    endTime: s.endTime,
    mode: s.mode,
    isBooked: s.isBooked,
  }));

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
              Availability
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              Manage your calendar
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Set when you are available (online or in-person). Clients can see
              these slots.
            </p>
          </header>
          <Link
            href="/dashboard"
            className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Back to dashboard
          </Link>
        </div>

        <AvailabilityCalendar
          escortId={profile.id}
          initialSlots={serialized}
          className="mt-8"
        />
      </div>
    </main>
  );
}
