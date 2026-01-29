import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "18+ Policy",
  description: "Age restriction and 18+ policy.",
};

export default function EighteenPlusPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-semibold sm:text-3xl">
          18+ only
        </h1>
        <p className="mt-4 text-zinc-400">
          This platform is intended for adults only. You must be 18 years of age
          or older to access the site.
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          If you entered via the age gate &quot;Exit&quot; option, you may return
          when you meet the age requirement and accept our terms.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700"
          >
            I am 18+ — Enter site
          </Link>
          <Link
            href="/terms"
            className="rounded-xl border border-zinc-600 px-6 py-3 text-sm text-zinc-400 hover:bg-zinc-900"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </main>
  );
}
