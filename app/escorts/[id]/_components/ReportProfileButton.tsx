"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { submitReport } from "@/app/report/actions";

type ReportProfileButtonProps = {
  escortId: string;
  escortName: string;
  isLoggedIn: boolean;
};

const REASONS = [
  { value: "fake_profile", label: "Fake profile" },
  { value: "underage", label: "Underage" },
  { value: "abuse", label: "Abuse" },
  { value: "scam", label: "Scam" },
] as const;

export function ReportProfileButton({ escortId, escortName, isLoggedIn }: ReportProfileButtonProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("escortId", escortId);
    startTransition(async () => {
      const res = await submitReport({ ok: false }, formData);
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        setError(res.error ?? "Something went wrong.");
      }
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300"
      >
        Report profile
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-labelledby="report-title"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="report-title" className="text-lg font-semibold text-white">
              Report profile
            </h2>
            <p className="mt-1 text-sm text-zinc-500">{escortName}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-zinc-400">Reason</label>
                <select
                  name="reason"
                  required
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200"
                >
                  {REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400">Details (optional)</label>
                <textarea
                  name="details"
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500"
                  placeholder="Additional context..."
                />
              </div>
              {!isLoggedIn && (
                <p className="text-xs text-zinc-500">
                  You must be signed in to report.{" "}
                  <Link href="/auth/login" className="text-emerald-400 hover:underline">
                    Sign in
                  </Link>
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-lg border border-zinc-600 bg-zinc-800 py-2 text-sm text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending || !isLoggedIn}
                  className="flex-1 rounded-lg bg-amber-600 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pending ? "Submitting…" : isLoggedIn ? "Submit report" : "Sign in to report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
