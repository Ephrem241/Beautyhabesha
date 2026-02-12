"use client";

import { useState, useTransition } from "react";
import Image from "next/image";

import { approveSubscription, rejectSubscription } from "../actions";

type PendingSubscription = {
  _id: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  planId: string;
  planPriceLabel: string;
  planDurationLabel: string;
  paymentMethod: string;
  paymentProof: {
    url: string;
  };
  createdAt: Date;
};

type PendingSubscriptionsTableProps = {
  subscriptions: PendingSubscription[];
};

const actionButtonStyles =
  "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default function PendingSubscriptionsTable({
  subscriptions,
}: PendingSubscriptionsTableProps) {
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [pending, startTransition] = useTransition();

  const handleReject = (subscriptionId: string) => {
    if (rejectId !== subscriptionId) {
      setRejectId(subscriptionId);
      setRejectReason("");
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.set("subscriptionId", subscriptionId);
      formData.set("reason", rejectReason);
      await rejectSubscription(formData);
    });
  };

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        No pending subscriptions yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      <div className="hidden w-full md:block">
        <table className="w-full text-left text-sm text-zinc-300">
          <thead className="border-b border-zinc-800 text-xs uppercase tracking-[0.2em] text-zinc-500">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Payment</th>
              <th className="px-6 py-4">Proof</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((subscription) => (
              <tr
                key={subscription._id}
                className="border-b border-zinc-900"
              >
                <td className="px-6 py-4">
                  <p className="text-sm text-white">
                    {subscription.userName ?? "Unknown user"}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {subscription.userEmail ?? subscription.userId}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs">
                      {subscription.planId}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {subscription.planPriceLabel} •{" "}
                      {subscription.planDurationLabel}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs uppercase tracking-[0.2em] text-zinc-400">
                  {subscription.paymentMethod}
                </td>
                <td className="px-6 py-4">
                  <a
                    href={subscription.paymentProof.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-3"
                  >
                    <Image
                      src={subscription.paymentProof.url}
                      alt="Payment proof"
                      width={56}
                      height={56}
                      className="rounded-xl border border-zinc-800 object-cover"
                    />
                    <span className="text-xs text-emerald-300">
                      View proof
                    </span>
                  </a>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={approveSubscription}>
                      <input
                        type="hidden"
                        name="subscriptionId"
                        value={subscription._id}
                      />
                      <button
                        type="submit"
                        disabled={pending}
                        className={`${actionButtonStyles} bg-emerald-400 text-emerald-950 hover:bg-emerald-300 focus-visible:outline-emerald-400 disabled:opacity-50`}
                      >
                        Approve
                      </button>
                    </form>
                    {rejectId === subscription._id ? (
                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          placeholder="Rejection reason (optional)"
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          className="rounded border border-zinc-600 bg-zinc-800 px-2 py-1 text-sm text-zinc-200 placeholder-zinc-500"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleReject(subscription._id)}
                            disabled={pending}
                            className={`${actionButtonStyles} bg-red-600 text-white hover:bg-red-700 disabled:opacity-50`}
                          >
                            {pending ? "Processing…" : "Confirm reject"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setRejectId(null)}
                            disabled={pending}
                            className={`${actionButtonStyles} bg-zinc-700 text-zinc-200 hover:bg-zinc-600 disabled:opacity-50`}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleReject(subscription._id)}
                        disabled={pending}
                        className={`${actionButtonStyles} bg-zinc-900 text-zinc-200 hover:bg-zinc-800 focus-visible:outline-zinc-500 disabled:opacity-50`}
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 p-4 md:hidden">
        {subscriptions.map((subscription) => (
          <div
            key={subscription._id}
            className="rounded-2xl border border-zinc-800 bg-black p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  {subscription.userName ?? "Unknown user"}
                </p>
                <p className="text-xs text-zinc-500">
                  {subscription.userEmail ?? subscription.userId}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-full border border-zinc-800 px-3 py-1 text-xs text-zinc-300">
                  {subscription.planId}
                </span>
                <p className="mt-2 text-xs text-zinc-500">
                  {subscription.planPriceLabel} •{" "}
                  {subscription.planDurationLabel}
                </p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-zinc-500">
              <span>{subscription.paymentMethod}</span>
              <a
                href={subscription.paymentProof.url}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-300"
              >
                View proof
              </a>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <form action={approveSubscription} className="flex-1">
                <input
                  type="hidden"
                  name="subscriptionId"
                  value={subscription._id}
                />
                <button
                  type="submit"
                  disabled={pending}
                  className={`${actionButtonStyles} w-full bg-emerald-400 text-emerald-950 hover:bg-emerald-300 focus-visible:outline-emerald-400 disabled:opacity-50`}
                >
                  Approve
                </button>
              </form>
              {rejectId === subscription._id ? (
                <>
                  <input
                    type="text"
                    placeholder="Rejection reason (optional)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="rounded border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleReject(subscription._id)}
                      disabled={pending}
                      className={`${actionButtonStyles} flex-1 bg-red-600 text-white hover:bg-red-700 disabled:opacity-50`}
                    >
                      {pending ? "Processing…" : "Confirm reject"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejectId(null)}
                      disabled={pending}
                      className={`${actionButtonStyles} flex-1 bg-zinc-700 text-zinc-200 hover:bg-zinc-600 disabled:opacity-50`}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => handleReject(subscription._id)}
                  disabled={pending}
                  className={`${actionButtonStyles} w-full bg-zinc-900 text-zinc-200 hover:bg-zinc-800 focus-visible:outline-zinc-500 disabled:opacity-50`}
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

