"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { approveDeposit, rejectDeposit, type AdminBookingActionResult } from "../actions";

type Deposit = {
  id: string;
  bookingId: string;
  amount: number;
  paymentMethod: string;
  receiptUrl: string;
  userName: string;
  userEmail: string;
  escortName: string;
  date: string;
  startTime: string;
  endTime: string;
  createdAt: string;
};

type PendingDepositsPanelProps = {
  deposits: Deposit[];
};

export default function PendingDepositsPanel({ deposits }: PendingDepositsPanelProps) {
  const [items, setItems] = useState(deposits);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [result, setResult] = useState<AdminBookingActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const handleApprove = (depositId: string) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("depositId", depositId);
      const res = await approveDeposit({ ok: false }, formData);
      setResult(res);
      if (res.ok) setItems((prev) => prev.filter((d) => d.id !== depositId));
    });
  };

  const handleReject = (depositId: string) => {
    if (rejectId !== depositId) {
      setRejectId(depositId);
      setRejectReason("");
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.set("depositId", depositId);
      formData.set("reason", rejectReason);
      const res = await rejectDeposit({ ok: false }, formData);
      setResult(res);
      if (res.ok) {
        setItems((prev) => prev.filter((d) => d.id !== depositId));
        setRejectId(null);
      }
    });
  };

  const paymentMethodLabel: Record<string, string> = {
    telebirr: "Telebirr",
    bank_transfer: "Bank transfer",
    cash: "Cash",
  };

  return (
    <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-amber-300">
        Pending deposits ({items.length})
      </h2>
      {result && !result.ok && (
        <p className="mt-2 text-sm text-red-300">{result.error}</p>
      )}
      <ul className="mt-4 space-y-4">
        {items.map((d) => (
          <li
            key={d.id}
            className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-zinc-200">
                {d.escortName} · {d.date} {d.startTime}–{d.endTime}
              </p>
              <p className="text-sm text-zinc-500">
                {d.userName} ({d.userEmail}) · {paymentMethodLabel[d.paymentMethod] ?? d.paymentMethod} · ETB {d.amount}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPreviewUrl(d.receiptUrl)}
                className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700"
              >
                View receipt
              </button>
              <button
                type="button"
                onClick={() => handleApprove(d.id)}
                disabled={pending}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                Approve
              </button>
              {rejectId === d.id ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    placeholder="Rejection reason (optional)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-zinc-200"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleReject(d.id)}
                      disabled={pending}
                      className="rounded bg-red-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectId(null)}
                      className="rounded bg-zinc-600 px-2 py-1 text-xs text-zinc-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleReject(d.id)}
                  disabled={pending}
                  className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                >
                  Reject
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewUrl(null)}
          role="dialog"
          aria-label="Receipt preview"
        >
          <div className="relative max-h-[90vh] max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute -top-10 right-0 rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-200"
            >
              Close
            </button>
            <Image
              src={previewUrl}
              alt="Deposit receipt"
              width={800}
              height={600}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
              unoptimized
            />
          </div>
        </div>
      )}
    </div>
  );
}
