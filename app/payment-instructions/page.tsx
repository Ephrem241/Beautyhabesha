import Link from "next/link";

import {
  getActiveSubscriptionPlans,
  getSubscriptionPlanBySlug,
} from "@/lib/subscription-plans";
import { formatPrice, formatDurationDays } from "@/lib/plan-format";
import { getAuthSession } from "@/lib/auth";

import PaymentForm from "./_components/PaymentForm";

type PaymentInstructionsPageProps = {
  searchParams?: { plan?: string };
};

export default async function PaymentInstructionsPage({
  searchParams,
}: PaymentInstructionsPageProps) {
  const slug = searchParams?.plan ?? "vip";
  const session = await getAuthSession();
  const selectedPlan =
    (await getSubscriptionPlanBySlug(slug)) ??
    (await getActiveSubscriptionPlans()).find((p) => p.price > 0) ?? null;

  if (!selectedPlan) {
    return (
      <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
        <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-center">
          <h1 className="text-xl font-semibold">No plan selected</h1>
          <p className="mt-2 text-sm text-zinc-400">
            <a href="/pricing" className="text-emerald-400 hover:underline">
              Choose a plan
            </a>{" "}
            and return here to pay.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)] sm:rounded-3xl sm:p-6 lg:p-8">
        <h1 className="text-xl font-semibold sm:text-2xl">Payment instructions</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Send your payment using one of the options below. Upload proof to
          activate your {selectedPlan.name} plan after admin approval.
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

        <div className="mt-6 grid gap-3 sm:mt-8 sm:gap-4 sm:grid-cols-2">
          <section className="rounded-xl border border-zinc-800 bg-black p-4 sm:rounded-2xl sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Bank transfer
            </p>
            <p className="mt-3 text-sm text-zinc-300">
              Account name: Beautyhabesha
            </p>
            <p className="text-sm text-zinc-300">Account number: 000-000-0000</p>
          </section>
          <section className="rounded-xl border border-zinc-800 bg-black p-4 sm:rounded-2xl sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Mobile money
            </p>
            <p className="mt-3 text-sm text-zinc-300">Provider: TeleBirr</p>
            <p className="text-sm text-zinc-300">Number: 0912 000 000</p>
          </section>
        </div>

        {session?.user ? (
          <PaymentForm planSlug={selectedPlan.slug} />
        ) : (
          <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-4 sm:mt-8 sm:p-6">
            <p className="text-sm text-zinc-300">
              Sign in or sign up to upload payment proof and request plan activation.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/auth/login?callbackUrl=${encodeURIComponent(`/payment-instructions?plan=${selectedPlan.slug}`)}`}
                className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-400 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                Sign in
              </Link>
              <Link
                href={`/auth/register?redirect=${encodeURIComponent(`/payment-instructions?plan=${selectedPlan.slug}`)}`}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-zinc-600 px-4 py-3 text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
