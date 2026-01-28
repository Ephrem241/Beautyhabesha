import type { PlanDetails } from "@/lib/plans";

type PlanSummaryProps = {
  plan: PlanDetails;
};

export default function PlanSummary({ plan }: PlanSummaryProps) {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
            Selected plan
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {plan.name}
          </h2>
        </div>
        <span className="rounded-full border border-zinc-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-zinc-300">
          {plan.priceLabel}
        </span>
      </div>

      <p className="mt-3 text-sm text-zinc-400">{plan.description}</p>
      <p className="mt-4 text-sm text-zinc-500">
        Duration: {plan.durationLabel}
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
