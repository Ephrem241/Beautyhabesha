"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { uploadDeposit, type BookingActionResult } from "@/app/booking/actions";

type DepositFormProps = {
  bookingId: string;
  amount: number;
};

export function DepositForm({ bookingId, amount }: DepositFormProps) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<BookingActionResult | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("bookingId", bookingId);
    formData.set("amount", String(amount));
    startTransition(async () => {
      const res = await uploadDeposit({ ok: false }, formData);
      setResult(res);
      if (res.ok) {
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {result && !result.ok && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {result.error}
        </div>
      )}
      {result?.ok && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          Deposit submitted. Redirecting to dashboard…
        </div>
      )}
      <div>
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
          Amount (ETB)
        </label>
        <input
          type="number"
          value={amount}
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
        <Link
          href="/dashboard"
          className="flex-1 rounded-xl border border-zinc-600 bg-zinc-800 px-4 py-2 text-center text-sm text-zinc-300 hover:bg-zinc-700"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Submit deposit"}
        </button>
      </div>
    </form>
  );
}
