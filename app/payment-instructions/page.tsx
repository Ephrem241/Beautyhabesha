import { getEffectivePlanCatalog, type PlanId } from "@/lib/plans";

import PaymentForm from "./_components/PaymentForm";

type PaymentInstructionsPageProps = {
  searchParams?: {
    plan?: PlanId;
  };
};

export default async function PaymentInstructionsPage({
  searchParams,
}: PaymentInstructionsPageProps) {
  const plans = await getEffectivePlanCatalog();
  const selectedPlan =
    plans.find((plan) => plan.id === (searchParams?.plan ?? "VIP")) ??
    plans.find((plan) => plan.id !== "Normal")!;

  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)]">
        <h1 className="text-2xl font-semibold">Payment instructions</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Send your payment using one of the options below. Upload proof to
          activate your {selectedPlan.name} plan after admin approval.
        </p>

        <div className="mt-6 rounded-2xl border border-zinc-800 bg-black p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Selected plan
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-zinc-300">
            <span className="rounded-full border border-zinc-800 px-3 py-1">
              {selectedPlan.name}
            </span>
            <span>{selectedPlan.priceLabel}</span>
            <span>{selectedPlan.durationLabel}</span>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <section className="rounded-2xl border border-zinc-800 bg-black p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Bank transfer
            </p>
            <p className="mt-3 text-sm text-zinc-300">
              Account name: Beautyhabesha
            </p>
            <p className="text-sm text-zinc-300">Account number: 000-000-0000</p>
          </section>
          <section className="rounded-2xl border border-zinc-800 bg-black p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Mobile money
            </p>
            <p className="mt-3 text-sm text-zinc-300">Provider: TeleBirr</p>
            <p className="text-sm text-zinc-300">Number: 0912 000 000</p>
          </section>
        </div>

        <PaymentForm planId={selectedPlan.id} />
      </div>
    </main>
  );
}
