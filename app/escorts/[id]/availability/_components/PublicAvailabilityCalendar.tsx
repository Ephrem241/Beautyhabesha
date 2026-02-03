"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Slot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: "online" | "in_person";
  isBooked: boolean;
};

type PublicAvailabilityCalendarProps = {
  slots: Slot[];
  escortId: string;
  escortName: string;
  currentModeFilter: "all" | "online" | "in_person";
};

export function PublicAvailabilityCalendar({
  slots,
  escortId,
  escortName,
  currentModeFilter,
}: PublicAvailabilityCalendarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setModeFilter = (mode: "all" | "online" | "in_person") => {
    const next = new URLSearchParams(searchParams.toString());
    if (mode === "all") {
      next.delete("mode");
    } else {
      next.set("mode", mode);
    }
    router.push(`/profiles/${escortId}/availability?${next.toString()}`);
  };

  const groupedByDate = slots.reduce<Record<string, Slot[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedByDate).sort();

  return (
    <div className="mt-8">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500">Filter by mode:</span>
        <button
          type="button"
          onClick={() => setModeFilter("all")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            currentModeFilter === "all"
              ? "bg-zinc-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setModeFilter("online")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            currentModeFilter === "online"
              ? "bg-emerald-600/30 text-emerald-300"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Online
        </button>
        <button
          type="button"
          onClick={() => setModeFilter("in_person")}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            currentModeFilter === "in_person"
              ? "bg-amber-600/30 text-amber-300"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          In person
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
        <p className="text-xs text-zinc-500">
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-500/60 align-middle" />{" "}
          Available &nbsp;
          <span className="inline-block h-3 w-3 rounded-full bg-amber-500/60 align-middle" />{" "}
          Booked
        </p>

        {sortedDates.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">
            No availability set for the next 60 days.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {sortedDates.map((dateStr) => (
              <li key={dateStr}>
                <p className="text-xs font-medium text-zinc-400">
                  {new Date(dateStr + "Z").toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {groupedByDate[dateStr]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot) => (
                      <li
                        key={slot.id}
                        className={`rounded-xl border px-4 py-2 ${
                          slot.isBooked
                            ? "border-amber-500/30 bg-amber-500/10"
                            : "border-zinc-700 bg-zinc-900/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              slot.isBooked ? "bg-amber-500" : "bg-emerald-500"
                            }`}
                          />
                          <span className="text-sm text-zinc-200">
                            {slot.startTime}–{slot.endTime}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              slot.mode === "online"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {slot.mode === "in_person" ? "In person" : "Online"}
                          </span>
                          {slot.isBooked && (
                            <span className="text-xs text-amber-300">Booked</span>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center text-sm text-zinc-400">
        To request a booking with {escortName}, go to{" "}
        <a href={`/profiles/${escortId}`} className="font-medium text-emerald-400 hover:text-emerald-300">
          {escortName}&apos;s profile
        </a>{" "}
        and use &quot;Request booking&quot;.
      </div>
    </div>
  );
}
