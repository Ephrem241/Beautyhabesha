import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Beautyhabesha.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <Link href="/" className="text-sm text-zinc-400 hover:text-emerald-400">
          ← Back
        </Link>
        <h1 className="mt-6 text-2xl font-semibold sm:text-3xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: January 2025</p>

        <div className="prose prose-invert mt-8 max-w-none text-sm text-zinc-300">
          <p>
            Welcome to Beautyhabesha. By using this platform you agree to these
            Terms of Service. This platform is intended for adults (18+) only.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-white">
            1. Eligibility
          </h2>
          <p>
            You must be at least 18 years of age to use this service. By
            accessing the platform you confirm that you meet this requirement.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-white">
            2. Platform role
          </h2>
          <p>
            Beautyhabesha is a membership and directory platform. We do not
            provide escort services. All arrangements are solely between
            consenting adults. We are not responsible for conduct, agreements,
            or interactions between users.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-white">
            3. User conduct
          </h2>
          <p>
            You agree to use the platform lawfully and to not harass, abuse, or
            harm others. You must not upload content you do not own or have
            rights to use. We reserve the right to suspend or terminate accounts
            that violate these terms.
          </p>
          <h2 className="mt-8 text-lg font-semibold text-white">
            4. Contact
          </h2>
          <p>
            For questions about these terms, please contact support through the
            platform.
          </p>
        </div>

        <div className="mt-12 flex gap-4">
          <Link
            href="/privacy"
            className="text-sm text-emerald-400 hover:underline"
          >
            Privacy Policy
          </Link>
          <Link href="/" className="text-sm text-zinc-400 hover:underline">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
