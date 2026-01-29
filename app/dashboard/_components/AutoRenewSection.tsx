"use client";

import { useTransition } from "react";
import { setAutoRenew, type RenewalDashboardData } from "../actions";

type AutoRenewSectionProps = {
  data: RenewalDashboardData;
};

export function AutoRenewSection({ data }: AutoRenewSectionProps) {
  const [pending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      await setAutoRenew(!data.autoRenew);
      window.location.reload();
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
        Auto-renew
      </h2>
      <p className="mt-1 text-xs text-zinc-500">
        Automatically create a renewal payment before your plan expires. You
        must submit payment proof for approval.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          className={`rounded-xl border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${
            data.autoRenew
              ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
              : "border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          {pending ? "Updating…" : data.autoRenew ? "ON" : "OFF"}
        </button>
        {data.nextRenewalDate && (
          <p className="text-sm text-zinc-400">
            Next renewal:{" "}
            <span className="font-medium text-zinc-200">
              {new Date(data.nextRenewalDate).toLocaleDateString(undefined, {
                dateStyle: "medium",
              })}
            </span>
          </p>
        )}
      </div>
      {data.renewalHistory.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Renewal history
          </h3>
          <ul className="mt-2 space-y-2">
            {data.renewalHistory.slice(0, 10).map((sub) => (
              <li
                key={sub.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800 bg-black/40 px-3 py-2 text-xs"
              >
                <span className="font-medium text-zinc-300">{sub.planId}</span>
                <span
                  className={`rounded-full px-2 py-0.5 ${
                    sub.status === "active"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : sub.status === "pending"
                        ? "bg-amber-500/20 text-amber-300"
                        : sub.status === "expired"
                          ? "bg-zinc-600 text-zinc-400"
                          : "bg-zinc-600 text-zinc-400"
                  }`}
                >
                  {sub.status}
                </span>
                <span className="text-zinc-500">
                  {sub.endDate
                    ? new Date(sub.endDate).toLocaleDateString()
                    : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
