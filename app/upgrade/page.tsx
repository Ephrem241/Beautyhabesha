import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import {
  getPlanById,
  PLAN_CATALOG,
  type PlanId,
  type PlanDetails,
} from "@/lib/plans";

import PaymentInstructions from "./_components/PaymentInstructions";
import PaymentProofForm from "./_components/PaymentProofForm";
import PlanSummary from "./_components/PlanSummary";

export const metadata: Metadata = {
  title: "Upgrade",
  description: "Upgrade your membership and submit payment proof.",
};

type UpgradePageProps = {
  searchParams: Promise<{
    plan?: PlanId;
  }>;
};

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const params = await searchParams;
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const role = session.user.role;
  const isAdmin = role === "admin";

  const selectedPlan: PlanDetails =
    getPlanById(params.plan) ??
    PLAN_CATALOG.find((plan) => plan.id !== "Normal")!;

  if (!selectedPlan) {
    redirect("/pricing");
  }

  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Upgrade plan
          </p>
          <h1 className="text-3xl font-semibold">Complete your upgrade</h1>
          <p className="text-sm text-zinc-400">
            Submit payment proof for admin review. Your plan activates after approval.
          </p>
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <PlanSummary plan={selectedPlan} />
            <PaymentInstructions />
            {selectedPlan.priceEtb > 0 ? (
              isAdmin ? (
                <PaymentProofForm planId={selectedPlan.id} />
              ) : (
                <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-6 text-sm text-amber-200">
                  Only admins can submit payment proofs for plan upgrades. Please contact an
                  administrator to upgrade this plan.
                </div>
              )
            ) : (
              <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-sm text-emerald-200">
                The Normal plan is free. No payment is required.
              </div>
            )}
          </div>
          <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
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
