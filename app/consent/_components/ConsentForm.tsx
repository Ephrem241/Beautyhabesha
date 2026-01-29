"use client";

import { useActionState } from "react";
import Link from "next/link";
import { submitConsent, type ConsentResult } from "../actions";

type ConsentFormProps = { className?: string };

export function ConsentForm({ className = "" }: ConsentFormProps) {
  const [state, formAction] = useActionState<ConsentResult, FormData>(
    submitConsent,
    { ok: false }
  );

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center text-emerald-200">
        <p className="font-medium">All agreements accepted.</p>
        <Link href="/escort/profile" className="mt-3 inline-block text-sm text-emerald-300 hover:underline">
          Continue to your profile →
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className={`space-y-6 ${className}`}>
      {state?.error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      )}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6 space-y-4">
        <label className="flex gap-3">
          <input type="checkbox" name="terms" required className="mt-1 rounded border-zinc-600" />
          <span className="text-sm text-zinc-200">
            I accept the{" "}
            <Link href="/terms" className="text-emerald-400 hover:underline">
              Terms of Service
            </Link>
            .
          </span>
        </label>
        <label className="flex gap-3">
          <input type="checkbox" name="content" required className="mt-1 rounded border-zinc-600" />
          <span className="text-sm text-zinc-200">
            I accept the{" "}
            <Link href="/consent/legal" className="text-emerald-400 hover:underline">
              Content &amp; Consent Agreement
            </Link>
            .
          </span>
        </label>
        <label className="flex gap-3">
          <input type="checkbox" name="18_plus" required className="mt-1 rounded border-zinc-600" />
          <span className="text-sm text-zinc-200">
            I confirm that I am 21 years of age or older.
          </span>
        </label>
        <label className="flex gap-3">
          <input type="checkbox" name="ownership" required className="mt-1 rounded border-zinc-600" />
          <span className="text-sm text-zinc-200">
            I confirm that all content I upload is owned by me or I have the
            right to use it.
          </span>
        </label>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
      >
        Accept all and continue
      </button>
    </form>
  );
}
