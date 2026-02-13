import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { getEscortsGroupedByPlan } from "@/lib/escorts";
import { getViewerHasActiveSubscription } from "@/lib/viewer-access";
import { GridView } from "@/app/escorts/_components/GridView";

export async function ModelsByPlanSection() {
  const session = await getAuthSession();
  const viewerUserId = session?.user?.id ?? null;
  const viewerHasAccess = await getViewerHasActiveSubscription(viewerUserId);
  const { platinum, vip, normal } = await getEscortsGroupedByPlan({
    viewerUserId,
    limitPerPlan: 4,
  });

  const hasAny = platinum.length > 0 || vip.length > 0 || normal.length > 0;
  if (!hasAny) return null;

  return (
    <section className="mt-12 sm:mt-16">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold sm:text-xl">Models by plan</h2>
        <Link
          href="/escorts"
          className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-300 transition hover:text-emerald-200"
        >
          View all models
        </Link>
      </div>

      {platinum.length > 0 && (
        <div className="mt-6 sm:mt-8">
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-base font-semibold text-emerald-300">Platinum Models</h3>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs uppercase tracking-[0.15em] text-emerald-300">
              Featured
            </span>
          </div>
          <GridView escorts={platinum} viewerHasAccess={viewerHasAccess} />
        </div>
      )}

      {vip.length > 0 && (
        <div className="mt-10 sm:mt-12">
          <h3 className="mb-3 text-base font-semibold text-amber-300">VIP Models</h3>
          <GridView escorts={vip} viewerHasAccess={viewerHasAccess} />
        </div>
      )}

      {normal.length > 0 && (
        <div className="mt-10 sm:mt-12">
          <h3 className="mb-3 text-base font-semibold text-zinc-300">Standard Models</h3>
          <GridView escorts={normal} viewerHasAccess={viewerHasAccess} />
        </div>
      )}
    </section>
  );
}
