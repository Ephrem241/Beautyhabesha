import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Content & Consent Agreement",
  description: "Content and consent agreement for escorts.",
};

export default function ConsentLegalPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Back
        </Link>
        <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">
          Content &amp; Consent Agreement
        </h1>
        <p className="mt-2 text-sm text-zinc-500">For escorts</p>

        <div className="prose prose-invert mt-8 max-w-none text-sm text-zinc-300">
          <p>
            By uploading content and using the platform as an escort, you agree
            to the following.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>You are 18 years of age or older.</li>
            <li>You own all content you upload or have the right to use it.</li>
            <li>You consent to your profile and approved content being displayed in accordance with the platform’s functionality.</li>
            <li>You will not upload illegal or non-consensual content.</li>
          </ul>
          <p className="mt-6">
            Violation may result in removal of content and suspension or
            termination of your account.
          </p>
        </div>

        <div className="mt-12 flex gap-4">
          <Link href="/terms" className="text-sm text-emerald-400 hover:underline">
            Terms of Service
          </Link>
          <Link href="/consent" className="text-sm text-emerald-400 hover:underline">
            Accept agreements
          </Link>
          <Link href="/" className="text-sm text-zinc-400 hover:underline">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
