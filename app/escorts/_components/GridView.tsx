import type { PublicEscort } from "@/lib/escorts";
import type { PlanId } from "@/lib/plans";
import { ButtonLink } from "@/app/_components/ui/Button";
import { BlurGate } from "@/app/_components/BlurGate";
import { ContactChip } from "@/app/_components/ContactChip";
import { OnlineBadge } from "@/app/_components/OnlineBadge";
import { PlanBadge } from "@/app/_components/PlanBadge";
import { ProfileAvatar } from "@/app/_components/ProfileAvatar";
import { ProfileSlider } from "@/app/_components/ProfileSlider";

function escortCardClassName(planId: PlanId): string {
  const base =
    "flex flex-col overflow-hidden rounded-2xl border bg-zinc-950 transition hover:-translate-y-0.5 sm:rounded-3xl ";
  if (planId === "Platinum") {
    return (
      base +
      "border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_24px_rgba(16,185,129,0.2)] hover:border-emerald-400/70"
    );
  }
  if (planId === "VIP") {
    return base + "border-amber-500/40 bg-zinc-900/80 hover:border-amber-400/50";
  }
  return base + "border-zinc-800 hover:border-emerald-500/60";
}

type GridViewProps = {
  escorts: PublicEscort[];
  viewerHasAccess: boolean;
};

export function GridView({ escorts, viewerHasAccess }: GridViewProps) {
  return (
    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {escorts.map((escort, idx) => (
        <article
          key={escort.id}
          className={escortCardClassName(escort.planId)}
        >
          {/* Image first – full-size, dominant */}
          <div className="relative flex-1 min-h-0 flex flex-col">
            <div className="relative w-full min-h-[200px] aspect-4/5 shrink-0 bg-zinc-900">
              <BlurGate
                isAllowed={viewerHasAccess}
                className="absolute inset-0"
                upgradeHref="/pricing"
              >
                <ProfileSlider
                  images={escort.images}
                  altPrefix={escort.displayName}
                  autoPlayInterval={4000}
                  allowFullQuality={viewerHasAccess}
                  displayName={escort.displayName}
                  escortId={escort.id}
                  priority={idx === 0}
                  className="h-full w-full"
                />
              </BlurGate>
              {/* Avatar overlay – blurred when viewer has no subscription */}
              <div className="absolute left-4 top-4 z-10 flex items-center gap-3">
                <div className="relative shrink-0">
                  <ProfileAvatar
                    src={escort.images[0]}
                    alt={escort.displayName}
                    size={48}
                    greenRing
                    blurWhenLocked={!viewerHasAccess}
                    className="shrink-0"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5">
                    <OnlineBadge lastActiveAt={escort.lastActiveAt} />
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-white truncate drop-shadow-sm">
                    {escort.displayName}
                  </h3>
                  <p className="text-xs text-zinc-500">{escort.city}</p>
                </div>
                <PlanBadge planId={escort.planId} showFeatured />
              </div>
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-black/5 to-transparent"
                aria-hidden
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
              <p className="text-sm text-zinc-400">
                {escort.bio ?? "Premium experience with verified photos."}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-zinc-800 p-4 sm:p-6">
            <ButtonLink
              href={`/profiles/${escort.id}`}
              className="w-full"
              variant="outline"
            >
              View profile
            </ButtonLink>
            {viewerHasAccess && (
              <ButtonLink
                href={`/profiles/${escort.id}/availability`}
                variant="outline"
                className="w-full"
              >
                Availability & Booking
              </ButtonLink>
            )}

            {/* Admin Contact Buttons */}
            <div className="mt-2 flex items-center justify-center pt-2 border-t border-zinc-800/50">
              <ContactChip variant="compact" label="Contact admin:" />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

