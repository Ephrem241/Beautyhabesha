import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

import { getAuthSession } from "@/lib/auth";
import { getSubscriptionPlanBySlug, getActiveSubscriptionPlans } from "@/lib/subscription-plans";
import { getActivePaymentAccounts } from "@/lib/payment-accounts";
import { prisma } from "@/lib/db";

import { UploadProofForm } from "./_components/UploadProofForm";

export const metadata: Metadata = {
  title: "Upload Payment Proof",
  description: "Upload your payment receipt to activate your subscription.",
};

type UploadProofPageProps = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function UploadProofPage({
  searchParams,
}: UploadProofPageProps) {
  // Access request data first to make this route dynamic and avoid prerender timing issues
  await headers();

  const session = await getAuthSession();
  const params = await searchParams;
  const planSlug = params?.plan ?? "";
  const uploadProofUrl = planSlug ? `/upload-proof?plan=${planSlug}` : "/upload-proof";

  const [plan, allPlans, paymentAccounts, pendingPayment] = await Promise.all([
    planSlug ? getSubscriptionPlanBySlug(planSlug) : null,
    getActiveSubscriptionPlans(),
    getActivePaymentAccounts(),
    session?.user?.id
      ? prisma.payment.findFirst({
          where: {
            userId: session.user.id,
            status: "pending",
          },
          orderBy: { createdAt: "desc" },
          include: { plan: true },
        })
      : Promise.resolve(null),
  ]);

  const selectedPlan = plan ?? (planSlug ? allPlans.find((p) => p.slug === planSlug) : null) ?? allPlans.find((p) => p.price > 0) ?? null;

  if (!selectedPlan || selectedPlan.price === 0) {
    return (
      <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
          <h1 className="text-xl font-semibold">No plan selected</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Please select a plan from the{" "}
            <Link href="/pricing" className="text-emerald-400 hover:underline">
              pricing page
            </Link>{" "}
            first.
          </p>
          <Link
            href="/pricing"
            className="mt-4 inline-block rounded-full bg-emerald-400 px-6 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-300"
          >
            Choose a plan
          </Link>
        </div>
      </main>
    );
  }

  if (session?.user && pendingPayment) {
    return (
      <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6">
        <div className="mx-auto max-w-lg rounded-2xl border border-amber-500/40 bg-amber-950/20 p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20">
            <svg
              className="h-6 w-6 animate-pulse text-amber-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-amber-200">
            Waiting for admin approval
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Your payment proof for {pendingPayment.plan.name} has been submitted.
            We will review it and activate your subscription soon.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-full border border-zinc-600 px-6 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-800"
          >
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
        <h1 className="text-xl font-semibold sm:text-2xl">Upload payment proof</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Choose your payment screenshot below for the{" "}
          <strong className="text-zinc-200">{selectedPlan.name}</strong> plan.
          When you click Submit, we&apos;ll ask you to sign in or sign up, then your proof will be sent.
        </p>
        {!session?.user && (
          <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-900/50 p-4">
            <p className="text-sm text-zinc-300">
              You can pick your receipt image first. After you submit, we&apos;ll send you to sign in or create an account (you may need to choose your image again after returning).
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <Link
                href={`/auth/login?callbackUrl=${encodeURIComponent(uploadProofUrl)}`}
                className="inline-flex flex-1 justify-center rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-300"
              >
                Sign in
              </Link>
              <Link
                href={`/auth/register?redirect=${encodeURIComponent(uploadProofUrl)}`}
                className="inline-flex flex-1 justify-center rounded-full border border-zinc-600 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Plan
          </p>
          <p className="mt-2 text-sm text-zinc-300">
            {selectedPlan.name} – {selectedPlan.price.toLocaleString("en-ET")}{" "}
            {selectedPlan.currency}
          </p>
        </div>

        <UploadProofForm
          planSlug={selectedPlan.slug}
          planId={selectedPlan.id}
          paymentAccounts={paymentAccounts as { id: string }[]}
        />

        <p className="mt-6 text-center text-xs text-zinc-500">
          <Link href={`/payment-instructions/${selectedPlan.slug}`} className="text-emerald-400 hover:underline">
            ← Back to payment instructions
          </Link>
        </p>
      </div>
    </main>
  );
}
