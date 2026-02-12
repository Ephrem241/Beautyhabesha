import type { PublicEscort } from "@/lib/escorts";
import type { PlanId } from "@/lib/plans";
import { ButtonLink } from "@/app/_components/ui/Button";
import { BlurGate } from "@/app/_components/BlurGate";
import { ContactChip } from "@/app/_components/ContactChip";
import { OnlineBadge } from "@/app/_components/OnlineBadge";
import { PlanBadge } from "@/app/_components/PlanBadge";
import { ProfileAvatar } from "@/app/_components/ProfileAvatar";
import { ProtectedEscortImage } from "@/app/_components/ProtectedEscortImage";

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
    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {escorts.map((escort, idx) => (
        <article
          key={escort.id}
          className={escortCardClassName(escort.planId)}
        >
          {/* Name, city, plan badge – always visible */}
          <div className="border-b border-zinc-800 px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="relative shrink-0">
                  <ProfileAvatar
                    src={escort.images[0]}
                    alt={escort.displayName}
                    size={44}
                    greenRing
                    className="shrink-0"
                  />
                  <span className="absolute -bottom-0.5 -right-0.5">
                    <OnlineBadge lastActiveAt={escort.lastActiveAt} />
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {escort.displayName}
                  </h3>
                  <p className="text-xs text-zinc-500">{escort.city}</p>
                </div>
              </div>
              <PlanBadge planId={escort.planId} showFeatured />
            </div>
          </div>

          {/* Image, bio – behind BlurGate when no subscription */}
          <BlurGate
            isAllowed={viewerHasAccess}
            className="relative flex-1"
            upgradeHref="/pricing"
          >
            <div className="relative w-full aspect-[4/5]">
              {escort.images[0] ? (
                <ProtectedEscortImage
                  src={escort.images[0]}
                  alt={escort.displayName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                  allowFullQuality={viewerHasAccess}
                  displayName={escort.displayName}
                  escortId={escort.id}
                  showWarningOverlay
                  priority={idx === 0}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-900 via-black to-emerald-950/60 text-xs uppercase tracking-[0.3em] text-zinc-500">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
              <p className="text-sm text-zinc-400">
                {escort.bio ?? "Premium experience with verified photos."}
              </p>
            </div>
          </BlurGate>

          <div className="flex flex-col gap-2 border-t border-zinc-800 p-4 sm:p-6">
            <ButtonLink href="/pricing" className="w-full" variant="outline">
              View profile
            </ButtonLink>
            <ButtonLink
              href={`/profiles/${escort.id}/availability`}
              variant="outline"
              className="w-full"
            >
              Availability & Booking
            </ButtonLink>

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

