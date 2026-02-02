"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-xl font-semibold">Dashboard error</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Something went wrong loading this page. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            type="button"
            onClick={reset}
            className="rounded-xl bg-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-600"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="rounded-xl border border-zinc-600 px-4 py-2 text-sm font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-800"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
