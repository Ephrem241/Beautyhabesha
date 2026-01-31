import type { PlanDisplay } from "@/lib/plan-format";
import { formatPrice, formatDurationDays } from "@/lib/plan-format";
import { ButtonLink } from "@/app/_components/ui/Button";

type PlanCardProps = {
  plan: PlanDisplay;
};

export default function PlanCard({ plan }: PlanCardProps) {
  const isPaid = plan.price > 0;

  return (
    <section
      className={`relative flex h-full flex-col rounded-2xl border px-4 pb-6 pt-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)] sm:rounded-3xl sm:px-6 sm:pt-8 ${
        plan.isPopular || plan.isRecommended
          ? "border-emerald-500/60 bg-gradient-to-br from-zinc-950 via-zinc-950 to-emerald-950/40"
          : "border-zinc-800 bg-zinc-950"
      } transition hover:-translate-y-0.5 hover:border-emerald-500/60`}
    >
      <div className="absolute right-4 top-4 flex flex-col items-end gap-1 sm:right-6 sm:top-6">
        {plan.isPopular && (
          <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Most Popular
          </span>
        )}
        {plan.isRecommended && (
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
            Recommended
          </span>
        )}
      </div>
      <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
      <p className="mt-2 text-sm text-zinc-400">
        {plan.price > 0
          ? "Premium visibility and feature access."
          : "Start for free with a visible profile."}
      </p>
      <div className="mt-6">
        <p className="text-3xl font-semibold text-white">
          {formatPrice(plan)}
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          {formatDurationDays(plan.durationDays)}
        </p>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-zinc-300">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
              <svg className="h-2.5 w-2.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {isPaid ? (
        <ButtonLink
          href={`/payment-instructions/${plan.slug}`}
          fullWidth
          size="md"
          className="mt-6"
        >
          Choose plan
        </ButtonLink>
      ) : null}
    </section>
  );
}
