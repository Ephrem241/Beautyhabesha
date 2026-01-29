import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import {
  getActiveSubscriptionPlans,
  getSubscriptionPlanBySlug,
} from "@/lib/subscription-plans";

import PaymentInstructions from "./_components/PaymentInstructions";
import PaymentProofForm from "./_components/PaymentProofForm";
import PlanSummary from "./_components/PlanSummary";

export const metadata: Metadata = {
  title: "Upgrade",
  description: "Upgrade your membership and submit payment proof.",
};

type UpgradePageProps = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const params = await searchParams;
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const selectedPlan = params.plan
    ? await getSubscriptionPlanBySlug(params.plan)
    : (await getActiveSubscriptionPlans()).find((p) => p.price > 0) ?? null;

  if (!selectedPlan || !selectedPlan.isActive || selectedPlan.price === 0) {
    redirect("/pricing");
  }

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Upgrade plan
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Complete your upgrade</h1>
          <p className="text-sm text-zinc-400">
            Submit payment proof for admin review. Your plan activates after approval.
          </p>
        </header>

        <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <PlanSummary plan={selectedPlan} />
            <PaymentInstructions />
            {selectedPlan.price > 0 ? (
              <PaymentProofForm planSlug={selectedPlan.slug} />
            ) : (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200 sm:rounded-3xl sm:p-6">
                This plan is free. No payment is required.
              </div>
            )}
          </div>
          <aside className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-400 sm:rounded-3xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Pending approval
            </p>
            <p className="mt-3">
              Once submitted, your subscription status will show as{" "}
              <span className="text-emerald-200">Pending Approval</span> until
              an admin verifies the payment.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
