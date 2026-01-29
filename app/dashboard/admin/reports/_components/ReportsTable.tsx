"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  markReportReviewed,
  disableReportedProfile,
  banReportedUser,
  type ReportActionResult,
} from "../actions";

type Report = {
  id: string;
  escortId: string;
  escortName: string;
  reporterEmail: string | null;
  reporterName: string | null;
  reason: string;
  details: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
};

type ReportsTableProps = { reports: Report[] };

const reasonLabel: Record<string, string> = {
  fake_profile: "Fake profile",
  underage: "Underage",
  abuse: "Abuse",
  scam: "Scam",
};

export default function ReportsTable({ reports }: ReportsTableProps) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ReportActionResult | null>(null);

  const handle = (
    fn: (prev: ReportActionResult, fd: FormData) => Promise<ReportActionResult>,
    reportId: string
  ) => {
    setResult(null);
    const fd = new FormData();
    fd.set("reportId", reportId);
    startTransition(async () => {
      const res = await fn({ ok: false }, fd);
      setResult(res);
      if (res.ok) window.location.reload();
    });
  };

  if (reports.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-400">
        No reports yet.
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-8">
      {result && !result.ok && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
          {result.error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Escort / Reporter
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Reason
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3 text-sm">
                    <p className="text-zinc-200">{r.escortName}</p>
                    <p className="text-xs text-zinc-500">
                      Report by {r.reporterName ?? r.reporterEmail ?? "—"}
                    </p>
                    {r.details && (
                      <p className="mt-1 text-xs text-zinc-400">{r.details}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400">
                    {reasonLabel[r.reason] ?? r.reason}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        r.status === "pending"
                          ? "bg-amber-500/20 text-amber-300"
                          : r.status === "action_taken"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-zinc-600/20 text-zinc-400"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {r.status === "pending" && (
                        <>
                          <button
                            type="button"
                            onClick={() => handle(markReportReviewed, r.id)}
                            disabled={pending}
                            className="rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
                          >
                            Dismiss
                          </button>
                          <button
                            type="button"
                            onClick={() => handle(disableReportedProfile, r.id)}
                            disabled={pending}
                            className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                          >
                            Disable profile
                          </button>
                          <button
                            type="button"
                            onClick={() => handle(banReportedUser, r.id)}
                            disabled={pending}
                            className="rounded-lg border border-red-500/50 bg-red-500/10 px-2 py-1 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                          >
                            Ban user
                          </button>
                        </>
                      )}
                      <Link
                        href={`/escorts/${r.escortId}`}
                        className="rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700"
                      >
                        View profile
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
