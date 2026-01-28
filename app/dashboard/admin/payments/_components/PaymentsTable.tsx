"use client";

import { useMemo, useState, useTransition } from "react";

import {
  approvePayment,
  rejectPayment,
  type PaymentActionResult,
} from "../actions";
import PreviewModal from "./PreviewModal";
import RejectModal from "./RejectModal";
import { Button } from "@/app/_components/ui/Button";

type PendingPayment = {
  id: string;
  userName?: string;
  userEmail?: string;
  planName: string;
  paymentMethod: string;
  submittedAt: string;
  proofUrl: string;
};

type PaymentsTableProps = {
  payments: PendingPayment[];
};

type Toast = {
  tone: "success" | "error";
  message: string;
};

export default function PaymentsTable({ payments }: PaymentsTableProps) {
  const [items, setItems] = useState(payments);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const emptyState = useMemo(() => items.length === 0, [items]);

  const handleAction = (
    action: "approve" | "reject",
    subscriptionId: string,
    reason?: string
  ) => {
    setPendingId(subscriptionId);
    startTransition(async () => {
      let result: PaymentActionResult;
      if (action === "approve") {
        const formData = new FormData();
        formData.set("subscriptionId", subscriptionId);
        result = await approvePayment({ ok: true }, formData);
      } else {
        const formData = new FormData();
        formData.set("subscriptionId", subscriptionId);
        if (reason) formData.set("reason", reason);
        result = await rejectPayment({ ok: true }, formData);
      }

      if (!result.ok) {
        setToast({
          tone: "error",
          message: result.error ?? "Action failed. Try again.",
        });
        setPendingId(null);
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== subscriptionId));
      setToast({
        tone: "success",
        message:
          action === "approve"
            ? "Subscription approved."
            : "Subscription rejected.",
      });
      setPendingId(null);
    });
  };

  return (
    <div className="mt-8">
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
            toast.tone === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          {toast.message}
        </div>
      ) : null}

      {emptyState ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
          No pending payments.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <table className="hidden w-full text-left text-sm text-zinc-300 md:table">
            <thead className="border-b border-zinc-800 text-xs uppercase tracking-[0.2em] text-zinc-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Plan</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Proof</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((payment) => (
                <tr
                  key={payment.id}
                  className="border-b border-zinc-900 transition hover:bg-zinc-900/40"
                >
                  <td className="px-6 py-4">
                    <p className="text-sm text-white">
                      {payment.userName ?? "Unknown user"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {payment.userEmail ?? "No email"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs">
                      {payment.planName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-zinc-400">
                    {payment.paymentMethod}
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-500">
                    {payment.submittedAt}
                  </td>
                  <td className="px-6 py-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-xl px-3 py-2"
                      onClick={() => setPreviewUrl(payment.proofUrl)}
                    >
                      Preview
                    </Button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        disabled={isPending && pendingId === payment.id}
                        onClick={() => handleAction("approve", payment.id)}
                        className="disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPending && pendingId === payment.id
                          ? "Working..."
                          : "Approve"}
                      </Button>
                      <Button
                        type="button"
                        disabled={isPending && pendingId === payment.id}
                        onClick={() => setRejectId(payment.id)}
                        variant="outline"
                        className="disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isPending && pendingId === payment.id
                          ? "Working..."
                          : "Reject"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-col gap-4 p-4 md:hidden">
            {items.map((payment) => (
              <div
                key={payment.id}
                className="rounded-2xl border border-zinc-800 bg-black p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {payment.userName ?? "Unknown user"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {payment.userEmail ?? "No email"}
                    </p>
                  </div>
                  <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300">
                    {payment.planName}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-zinc-500">
                  <span>{payment.paymentMethod}</span>
                  <span>{payment.submittedAt}</span>
                </div>

                <Button
                  type="button"
                  onClick={() => setPreviewUrl(payment.proofUrl)}
                  variant="outline"
                  fullWidth
                  className="mt-4"
                >
                  Preview proof
                </Button>

                <div className="mt-4 flex items-center gap-2">
                  <Button
                    type="button"
                    disabled={isPending && pendingId === payment.id}
                    onClick={() => handleAction("approve", payment.id)}
                    fullWidth
                    className="flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending && pendingId === payment.id
                      ? "Working..."
                      : "Approve"}
                  </Button>
                  <Button
                    type="button"
                    disabled={isPending && pendingId === payment.id}
                    onClick={() => setRejectId(payment.id)}
                    variant="outline"
                    fullWidth
                    className="flex-1 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isPending && pendingId === payment.id
                      ? "Working..."
                      : "Reject"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <PreviewModal imageUrl={previewUrl} onClose={() => setPreviewUrl(null)} />
      <RejectModal
        subscriptionId={rejectId}
        isPending={isPending}
        onClose={() => setRejectId(null)}
        onConfirm={(reason) => {
          if (!rejectId) return;
          handleAction("reject", rejectId, reason);
          setRejectId(null);
        }}
      />
    </div>
  );
}
