import type { PlanDetails } from "@/lib/plans";
import { ButtonLink } from "@/app/_components/ui/Button";

type PlanCardProps = {
  plan: PlanDetails;
  isLoggedIn: boolean;
};

export default function PlanCard({ plan, isLoggedIn }: PlanCardProps) {
  const isPaid = plan.id !== "Normal";

  return (
    <section
      className={`relative flex h-full flex-col rounded-2xl border px-4 pb-6 pt-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)] sm:rounded-3xl sm:px-6 sm:pt-8 ${
        plan.popular
          ? "border-emerald-500/60 bg-gradient-to-br from-zinc-950 via-zinc-950 to-emerald-950/40"
          : "border-zinc-800 bg-zinc-950"
      } transition hover:-translate-y-0.5 hover:border-emerald-500/60`}
    >
      {plan.popular ? (
        <span className="absolute right-4 top-4 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 sm:right-6 sm:top-6">
          Popular
        </span>
      ) : null}
      <h2 className="text-xl font-semibold text-white">{plan.name}</h2>
      <p className="mt-2 text-sm text-zinc-400">{plan.description}</p>
      <div className="mt-6">
        <p className="text-3xl font-semibold text-white">
          {plan.priceLabel}
        </p>
        <p className="mt-2 text-sm text-zinc-500">{plan.durationLabel}</p>
      </div>

      <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-zinc-300">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="mt-2 h-2 w-2 rounded-full bg-emerald-400" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {isPaid && isLoggedIn ? (
        <ButtonLink
          href={`/upgrade?plan=${plan.id}`}
          fullWidth
          size="md"
          className="mt-6"
        >
          Upgrade
        </ButtonLink>
      ) : null}

      {isPaid && !isLoggedIn ? (
        <p className="mt-6 text-center text-xs uppercase tracking-[0.2em] text-zinc-500">
          Sign in to upgrade
        </p>
      ) : null}
    </section>
  );
}
