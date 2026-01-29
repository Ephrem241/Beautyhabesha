import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Beautyhabesha.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Back
        </Link>
        <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: January 2025</p>

        <div className="prose prose-invert mt-8 max-w-none text-sm text-zinc-300">
          <p>
            Beautyhabesha respects your privacy. This policy describes how we
            collect, use, and protect your information.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-white">
            1. Information we collect
          </h2>
          <p>
            We collect account data (email, name, password hash), profile
            information you provide, consent records including timestamps and
            optionally IP, and usage data necessary to operate the service.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-white">
            2. How we use it
          </h2>
          <p>
            We use your data to provide the platform, enforce terms and consent,
            handle reports and moderation, and improve our services. We do not
            sell your personal information.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-white">
            3. Security
          </h2>
          <p>
            We use industry-standard measures to protect your data. Passwords
            are hashed. Sensitive operations are restricted to authorised roles.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-white">
            4. Contact
          </h2>
          <p>
            For privacy-related requests, contact support through the platform.
          </p>
        </div>

        <div className="mt-12 flex gap-4">
          <Link
            href="/terms"
            className="text-sm text-emerald-400 hover:underline"
          >
            Terms of Service
          </Link>
          <Link href="/" className="text-sm text-zinc-400 hover:underline">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
