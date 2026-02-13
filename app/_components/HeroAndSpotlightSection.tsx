import { getAuthSession } from "@/lib/auth";
import { getFeaturedEscorts } from "@/lib/escorts";
import { getViewerHasActiveSubscription } from "@/lib/viewer-access";
import { ButtonLink } from "@/app/_components/ui/Button";
import { HeroTextCarousel } from "@/app/_components/HeroTextCarousel";
import { HeroBackgroundCarousel } from "@/app/_components/HeroBackgroundCarousel";
import { SpotlightCarousel } from "@/app/_components/SpotlightCarousel";
import { ModelsByPlanSection } from "@/app/_components/ModelsByPlanSection";

export async function HeroAndSpotlightSection() {
  const session = await getAuthSession();
  const viewerUserId = session?.user?.id ?? null;
  const viewerHasAccess = await getViewerHasActiveSubscription(viewerUserId);
  const spotlight = await getFeaturedEscorts(6, { viewerUserId });

  return (
    <>
      <section className="relative mb-6 min-h-[160px] overflow-hidden rounded-2xl border border-zinc-800 sm:mb-8 sm:min-h-[180px] sm:rounded-3xl">
        <HeroBackgroundCarousel
          imageUrls={spotlight.map((e) => e.images[0]).filter(Boolean) as string[]}
          intervalMs={5000}
        />
        <div className="absolute inset-0 z-[1] bg-black/40" aria-hidden />
        <div className="relative z-10 flex items-center">
          <HeroTextCarousel />
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:rounded-3xl sm:p-6 lg:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
          Premium membership
        </p>
        <h2 className="mt-4 text-2xl font-semibold sm:text-3xl lg:text-4xl">
          Showcase premium profiles with Platinum visibility
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-zinc-400">
          Upgrade to unlock spotlight placement, featured badges, and priority
          listings across the platform.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <ButtonLink href="/pricing" size="md">
            View plans
          </ButtonLink>
          <ButtonLink href="/escorts" variant="outline" size="md">
            Browse models
          </ButtonLink>
        </div>
      </section>

      <section className="mt-8 sm:mt-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold sm:text-xl">Homepage spotlight</h2>
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-300">
            Platinum only
          </span>
        </div>
        <div className="mt-4 sm:mt-6">
          <SpotlightCarousel
            profiles={spotlight.slice(0, 6).map((escort) => ({
              id: escort.id,
              displayName: escort.displayName,
              city: escort.city ?? null,
              bio: escort.bio ?? null,
              images: escort.images,
              lastActiveAt: escort.lastActiveAt ?? null,
            }))}
            viewerHasAccess={viewerHasAccess}
          />
        </div>
      </section>

      <ModelsByPlanSection />
    </>
  );
}
