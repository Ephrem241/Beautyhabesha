import { notFound } from "next/navigation";
import Link from "next/link";

import { getPublicEscortById } from "@/lib/escorts";
import { getPublicAvailability } from "@/lib/availability";
import { PublicAvailabilityCalendar } from "./_components/PublicAvailabilityCalendar";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function EscortAvailabilityPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { mode: modeParam } = await searchParams;

  const escort = await getPublicEscortById(id, { viewerUserId: null });
  if (!escort) notFound();

  const fromDate = new Date();
  fromDate.setHours(0, 0, 0, 0);
  const toDate = new Date(fromDate.getTime() + 60 * 24 * 60 * 60 * 1000);

  const modeFilter: "online" | "in_person" | undefined =
    modeParam === "online" || modeParam === "in_person" ? modeParam : undefined;

  const slots = await getPublicAvailability(escort.id, {
    fromDate,
    toDate,
    mode: modeFilter,
  });

  const serialized = slots.map((s) => ({
    id: s.id,
    date: s.date.toISOString().slice(0, 10),
    startTime: s.startTime,
    endTime: s.endTime,
    mode: s.mode,
    isBooked: s.isBooked,
  }));

  const currentModeFilter: "all" | "online" | "in_person" =
    modeFilter ?? "all";

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <header>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
              Availability
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">
              {escort.displayName}
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Available time slots (read-only). Book via the profile page.
            </p>
          </header>
          <Link
            href={`/profiles/${id}`}
            className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Back to profile
          </Link>
        </div>

        <PublicAvailabilityCalendar
          slots={serialized}
          escortId={id}
          escortName={escort.displayName}
          currentModeFilter={currentModeFilter}
        />
      </div>
    </main>
  );
}
