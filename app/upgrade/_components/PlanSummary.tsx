import type { PlanDisplay } from "@/lib/plan-format";
import { formatPrice, formatDurationDays } from "@/lib/plan-format";

type PlanSummaryProps = {
  plan: PlanDisplay;
};

export default function PlanSummary({ plan }: PlanSummaryProps) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:rounded-3xl sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Selected plan
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">
            {plan.name}
          </h2>
        </div>
        <span className="w-fit rounded-full border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300">
          {formatPrice(plan)}
        </span>
      </div>

      <p className="mt-3 text-sm text-zinc-400">
        {plan.price > 0
          ? "Premium visibility and feature access. Activate after approval."
          : "Free plan. No payment required."}
      </p>
      <p className="mt-4 text-sm text-zinc-500">
        Duration: {formatDurationDays(plan.durationDays)}
      </p>

      <ul className="mt-4 grid gap-2 text-sm text-zinc-300">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="mt-2 h-2 w-2 rounded-full bg-emerald-400" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
