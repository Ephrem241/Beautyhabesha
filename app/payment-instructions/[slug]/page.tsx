import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import {
  getSubscriptionPlanBySlug,
  getActiveSubscriptionPlans,
} from "@/lib/subscription-plans";
import { formatPrice, formatDurationDays } from "@/lib/plan-format";
import { getAuthSession } from "@/lib/auth";
import { getActivePaymentAccounts } from "@/lib/payment-accounts";

import { CopyableAccountCard } from "../_components/CopyableAccountCard";
import { UploadProofForm } from "@/app/upload-proof/_components/UploadProofForm";

type PaymentInstructionsPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PaymentInstructionsPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const plan = await getSubscriptionPlanBySlug(slug);
    if (!plan) return { title: "Payment Instructions" };
    return {
      title: `Payment Instructions – ${plan.name}`,
      description: `Complete your payment for the ${plan.name} plan.`,
    };
  } catch (error) {
    // Fallback metadata if database is not accessible
    console.warn('[generateMetadata] Database error, using fallback metadata:', error);
    return { title: "Payment Instructions" };
  }
}

// Removed generateStaticParams() to make this route fully dynamic
// This avoids prerender timing issues with Prisma queries during build

export default async function PaymentInstructionsSlugPage({
  params,
}: PaymentInstructionsPageProps) {
  // Access request data first to make this route dynamic and avoid prerender timing issues
  await headers();

  const { slug } = await params;
  const [session, plan, allPlans, paymentAccounts] = await Promise.all([
    getAuthSession(),
    getSubscriptionPlanBySlug(slug),
    getActiveSubscriptionPlans(),
    getActivePaymentAccounts(),
  ]);

  const selectedPlan = plan ?? allPlans.find((p) => p.slug === slug) ?? null;

  if (!selectedPlan || selectedPlan.price === 0) {
    notFound();
  }

  const uploadProofUrl = `/upload-proof?plan=${selectedPlan.slug}`;
  const loginRedirect = `/auth/login?callbackUrl=${encodeURIComponent(uploadProofUrl)}`;
  const registerRedirect = `/auth/register?redirect=${encodeURIComponent(uploadProofUrl)}`;

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)] sm:rounded-3xl sm:p-6 lg:p-8">
        <h1 className="text-xl font-semibold sm:text-2xl">
          Payment instructions
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          Send your payment using one of the options below. After paying, click
          &quot;I Have Paid&quot; to upload your receipt and activate your{" "}
          {selectedPlan.name} plan after admin approval.
        </p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-black p-4 sm:mt-6 sm:rounded-2xl sm:p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Selected plan
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-300">
            <span className="rounded-full border border-zinc-800 px-3 py-1">
              {selectedPlan.name}
            </span>
            <span>{formatPrice(selectedPlan)}</span>
            <span>{formatDurationDays(selectedPlan.durationDays)}</span>
          </div>
        </div>

        <section className="mt-6 sm:mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Step-by-step
          </h2>
          <ol className="mt-4 space-y-3 text-sm text-zinc-300">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                1
              </span>
              <span>Select your preferred payment method below.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                2
              </span>
              <span>
                Transfer the exact amount ({formatPrice(selectedPlan)}) to the
                account.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                3
              </span>
              <span>Take a screenshot or photo of your payment receipt.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                4
              </span>
              <span>Click &quot;I Have Paid&quot; and upload your receipt.</span>
            </li>
          </ol>
        </section>

        <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-2">
          {paymentAccounts.map((acc) => (
            <CopyableAccountCard key={acc.id} account={acc} />
          ))}
          {paymentAccounts.length === 0 && (
            <p className="col-span-full text-center text-sm text-zinc-500">
              No payment accounts configured. Contact support.
            </p>
          )}
        </div>

        <div className="mt-8 rounded-2xl border-2 border-emerald-500/50 bg-emerald-950/30 p-4 sm:p-6">
          <p className="text-center text-sm font-semibold text-zinc-200">
            Already made your payment? Upload your receipt below.
          </p>
          {!session?.user && (
            <p className="mt-2 text-center text-xs text-zinc-500">
              You can choose your screenshot first. When you submit, we&apos;ll ask you to sign in or sign up if needed.
            </p>
          )}
          <UploadProofForm
            planSlug={selectedPlan.slug}
            planId={selectedPlan.id}
            paymentAccounts={paymentAccounts as { id: string }[]}
          />
          {!session?.user && (
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center sm:gap-3">
              <Link
                href={loginRedirect}
                className="inline-flex flex-1 justify-center rounded-full bg-zinc-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-600 sm:flex-initial"
              >
                Sign in
              </Link>
              <Link
                href={registerRedirect}
                className="inline-flex flex-1 justify-center rounded-full border border-zinc-600 px-4 py-2.5 text-sm font-semibold text-zinc-200 hover:bg-zinc-700 sm:flex-initial"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500">
          <Link href="/pricing" className="text-emerald-400 hover:underline">
            ← Choose a different plan
          </Link>
        </p>
      </div>
    </main>
  );
}
