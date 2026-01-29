import { getAllSubscriptionPlansForAdmin } from "@/lib/subscription-plans";
import { PlanForm } from "@/app/dashboard/admin/plans/_components/PlanForm";
import { PlansTable } from "@/app/dashboard/admin/plans/_components/PlansTable";

type AdminPlansSectionProps = {
  /** When true, use a compact header (e.g. inside tabs). */
  embedded?: boolean;
};

export async function AdminPlansSection({
  embedded = false,
}: AdminPlansSectionProps) {
  const plans = await getAllSubscriptionPlansForAdmin();

  return (
    <div className="space-y-8">
      {!embedded && (
        <header>
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Subscription plans
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Create, edit, enable/disable plans. Toggle popular and recommended
            badges. Soft-delete removes plans from pricing.
          </p>
        </header>
      )}
      {embedded && (
        <header>
          <h2 className="text-lg font-semibold text-white">
            Subscription plans
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Create, edit, enable/disable plans. Toggle popular and recommended
            badges. Soft-delete removes plans from pricing.
          </p>
        </header>
      )}
      <PlanForm />
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">All plans</h2>
        <PlansTable plans={plans} />
      </section>
    </div>
  );
}
