"use client";

import { useState, useTransition } from "react";
import { createBooking, uploadDeposit, type BookingActionResult } from "@/app/booking/actions";

type BookingModalProps = {
  escortId: string;
  displayName: string;
  defaultDepositAmount?: number;
  onClose: () => void;
};

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00",
];

export function BookingModal({
  escortId,
  displayName,
  defaultDepositAmount = 500,
  onClose,
}: BookingModalProps) {
  const [step, setStep] = useState<"form" | "deposit">("form");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [result, setResult] = useState<BookingActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmitBooking = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("escortId", escortId);
    formData.set("depositAmount", String(defaultDepositAmount));
    startTransition(async () => {
      const res = await createBooking({ ok: false }, formData);
      setResult(res);
      if (res.ok && res.bookingId) {
        setBookingId(res.bookingId);
        setStep("deposit");
      }
    });
  };

  const handleSubmitDeposit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (bookingId) formData.set("bookingId", bookingId);
    formData.set("amount", String(defaultDepositAmount));
    startTransition(async () => {
      const res = await uploadDeposit({ ok: false }, formData);
      setResult(res);
      if (res.ok) {
        setTimeout(() => onClose(), 1500);
      }
    });
  };

  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
      <div className="my-4 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {step === "form" ? "Request booking" : "Pay deposit"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="mt-1 text-sm text-zinc-500">{displayName}</p>

        {result && !result.ok && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
            {result.error}
          </div>
        )}
        {result?.ok && step === "deposit" && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            Deposit submitted. We will review and notify you.
          </div>
        )}

        {step === "form" && (
          <form onSubmit={handleSubmitBooking} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Date
              </label>
              <input
                type="date"
                name="date"
                min={minDate}
                required
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                  Start time
                </label>
                <select
                  name="startTime"
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                  End time
                </label>
                <select
                  name="endTime"
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Mode
              </label>
              <select
                name="mode"
                required
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="online">Online</option>
                <option value="in_person">In person</option>
              </select>
            </div>
            <div>
              <p className="text-xs text-zinc-500">
                Deposit: <span className="font-medium text-zinc-300">ETB {defaultDepositAmount}</span>
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {pending ? "Submitting…" : "Request booking"}
              </button>
            </div>
          </form>
        )}

        {step === "deposit" && bookingId && (
          <form onSubmit={handleSubmitDeposit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Amount (ETB)
              </label>
              <input
                type="number"
                name="amount"
                defaultValue={defaultDepositAmount}
                min={1}
                readOnly
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-300"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Payment method
              </label>
              <select
                name="paymentMethod"
                required
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="telebirr">Telebirr</option>
                <option value="bank_transfer">Bank transfer</option>
                <option value="cash">Cash</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Receipt (image)
              </label>
              <input
                type="file"
                name="receipt"
                accept="image/*"
                required
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 file:mr-2 file:rounded file:border-0 file:bg-emerald-600 file:px-3 file:py-1 file:text-sm file:text-white"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {pending ? "Uploading…" : "Submit deposit"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
