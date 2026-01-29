import { redirect } from "next/navigation";
import Link from "next/link";

import { getAuthSession } from "@/lib/auth";
import { hasEscortConsentComplete } from "@/lib/consent";
import { ConsentForm } from "./_components/ConsentForm";

export default async function ConsentPage() {
  const session = await getAuthSession();
  if (!session?.user?.id || session.user.role !== "escort") {
    redirect("/");
  }

  const complete = await hasEscortConsentComplete(session.user.id);
  if (complete) {
    redirect("/escort/profile");
  }

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-xl">
        <header className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
            Required agreements
          </p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Terms &amp; consent
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Escorts must accept the following before creating or editing a
            profile.
          </p>
        </header>

        <ConsentForm className="mt-8" />

        <p className="mt-6 text-center text-xs text-zinc-500">
          <Link href="/terms" className="text-emerald-400 hover:underline">
            Terms of Service
          </Link>
          {" · "}
          <Link href="/privacy" className="text-emerald-400 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </main>
  );
}
