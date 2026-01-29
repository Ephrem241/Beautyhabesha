"use client";

import { useState, useTransition } from "react";
import {
  createAvailability,
  updateAvailability,
  deleteAvailability,
  type AvailabilityActionResult,
} from "../actions";

const TIME_OPTIONS = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00",
  "17:00", "18:00", "19:00", "20:00", "21:00",
];

type Slot = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: "online" | "in_person";
  isBooked: boolean;
};

type AvailabilityCalendarProps = {
  escortId: string;
  initialSlots: Slot[];
  className?: string;
};

export function AvailabilityCalendar({
  escortId,
  initialSlots,
  className = "",
}: AvailabilityCalendarProps) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots);
  const [result, setResult] = useState<AvailabilityActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modeFilter, setModeFilter] = useState<"all" | "online" | "in_person">("all");

  const minDate = new Date().toISOString().slice(0, 10);

  const filteredSlots =
    modeFilter === "all"
      ? slots
      : slots.filter((s) => s.mode === modeFilter);

  const groupedByDate = filteredSlots.reduce<Record<string, Slot[]>>((acc, s) => {
    if (!acc[s.date]) acc[s.date] = [];
    acc[s.date].push(s);
    return acc;
  }, {});
  const sortedDates = Object.keys(groupedByDate).sort();

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("escortId", escortId);
    setResult(null);
    startTransition(async () => {
      const res = await createAvailability({ ok: false }, formData);
      setResult(res);
      if (res.ok) {
        const date = formData.get("date") as string;
        const startTime = formData.get("startTime") as string;
        const endTime = formData.get("endTime") as string;
        const mode = formData.get("mode") as "online" | "in_person";
        setSlots((prev) => [
          ...prev,
          { id: `new-${Date.now()}`, date, startTime, endTime, mode, isBooked: false },
        ]);
        form.reset();
        window.location.reload();
      }
    });
  };

  const handleUpdate = (id: string, formData: FormData) => {
    formData.set("id", id);
    setResult(null);
    startTransition(async () => {
      const res = await updateAvailability({ ok: false }, formData);
      setResult(res);
      if (res.ok) {
        setEditingId(null);
        window.location.reload();
      }
    });
  };

  const handleDelete = (id: string) => {
    const formData = new FormData();
    formData.set("id", id);
    setResult(null);
    startTransition(async () => {
      const res = await deleteAvailability({ ok: false }, formData);
      setResult(res);
      if (res.ok) {
        setSlots((prev) => prev.filter((s) => s.id !== id));
        setEditingId(null);
        window.location.reload();
      }
    });
  };

  return (
    <div className={className}>
      {result && !result.ok && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {result.error}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Add availability
        </h2>
        <form onSubmit={handleAdd} className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="block text-xs text-zinc-500">Date</label>
            <input
              type="date"
              name="date"
              min={minDate}
              required
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500">Start</label>
            <select
              name="startTime"
              required
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500">End</label>
            <select
              name="endTime"
              required
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
            >
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-500">Mode</label>
            <select
              name="mode"
              required
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
            >
              <option value="online">Online</option>
              <option value="in_person">In person</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {pending ? "Adding…" : "Add slot"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500">Filter:</span>
        <button
          type="button"
          onClick={() => setModeFilter("all")}
          className={`rounded-lg px-3 py-1 text-xs font-medium ${
            modeFilter === "all"
              ? "bg-zinc-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          All
        </button>
        <button
          type="button"
          onClick={() => setModeFilter("online")}
          className={`rounded-lg px-3 py-1 text-xs font-medium ${
            modeFilter === "online"
              ? "bg-emerald-600/30 text-emerald-300"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          Online
        </button>
        <button
          type="button"
          onClick={() => setModeFilter("in_person")}
          className={`rounded-lg px-3 py-1 text-xs font-medium ${
            modeFilter === "in_person"
              ? "bg-amber-600/30 text-amber-300"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          In person
        </button>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Your slots
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-500/60 align-middle" />{" "}
          Available &nbsp;
          <span className="inline-block h-3 w-3 rounded-full bg-amber-500/60 align-middle" />{" "}
          Booked
        </p>

        {sortedDates.length === 0 ? (
          <p className="mt-6 text-sm text-zinc-500">
            No availability set. Add slots above.
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
                <ul className="mt-2 space-y-2">
                  {groupedByDate[dateStr]
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((slot) => (
                      <li
                        key={slot.id}
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-2 ${
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
                        {editingId === slot.id ? (
                          <EditSlotForm
                            slot={slot}
                            timeOptions={TIME_OPTIONS}
                            onSave={(formData) => handleUpdate(slot.id, formData)}
                            onCancel={() => setEditingId(null)}
                            pending={pending}
                          />
                        ) : (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(slot.id)}
                              className="rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(slot.id)}
                              disabled={pending}
                              className="rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function EditSlotForm({
  slot,
  timeOptions,
  onSave,
  onCancel,
  pending,
}: {
  slot: Slot;
  timeOptions: string[];
  onSave: (formData: FormData) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(new FormData(e.currentTarget));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="date" value={slot.date} />
      <select
        name="startTime"
        defaultValue={slot.startTime}
        className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-200"
      >
        {timeOptions.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <select
        name="endTime"
        defaultValue={slot.endTime}
        className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-200"
      >
        {timeOptions.map((t) => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>
      <select
        name="mode"
        defaultValue={slot.mode}
        className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-200"
      >
        <option value="online">Online</option>
        <option value="in_person">In person</option>
      </select>
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-emerald-600 px-2 py-1 text-xs text-white disabled:opacity-50"
      >
        Save
      </button>
      <button type="button" onClick={onCancel} className="rounded bg-zinc-600 px-2 py-1 text-xs text-zinc-300">
        Cancel
      </button>
    </form>
  );
}
