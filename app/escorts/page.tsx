import type { Metadata } from "next";
import type { PlanId } from "@/lib/plans";
import { getAuthSession } from "@/lib/auth";
import { getPublicEscortsOptimized } from "@/lib/escorts";
import { getViewerHasActiveSubscription } from "@/lib/viewer-access";
import { ButtonLink } from "@/app/_components/ui/Button";
import { BlurGate } from "@/app/_components/BlurGate";
import { Breadcrumbs } from "@/app/_components/Breadcrumbs";
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

export const metadata: Metadata = {
  title: "Escort Listings",
  description: "Browse premium escort profiles by membership visibility.",
  alternates: { canonical: "/escorts" },
  openGraph: {
    title: "Escort Listings • Beautyhabesha",
    description: "Browse premium escort profiles by membership visibility.",
    type: "website",
    url: "/escorts",
  },
  twitter: { card: "summary_large_image", title: "Escort Listings • Beautyhabesha" },
};

export default async function EscortListingPage() {
  const session = await getAuthSession();
  const viewerUserId = session?.user?.id ?? null;
  const viewerHasAccess = await getViewerHasActiveSubscription(viewerUserId);
  const escorts = await getPublicEscortsOptimized({ viewerUserId });

  return (
    <div className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Escorts" }]} />
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Escort listings
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold sm:text-3xl">
                Discover premium profiles
              </h1>
              <p className="mt-1 text-sm text-zinc-400">
                Platinum profiles appear first, followed by VIP, then Normal.
                Subscribe to view full profiles.
              </p>
            </div>
            <ButtonLink href="/browse">
              Swipe to browse
            </ButtonLink>
          </div>
        </header>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {escorts.map((escort, idx) => (
            <article
              key={escort.id}
              className={escortCardClassName(escort.planId)}
            >
              {/* Name, city, plan badge – always visible */}
              <div className="border-b border-zinc-800 px-4 py-3 sm:px-6 sm:py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <ProfileAvatar
                      src={escort.images[0]}
                      alt={escort.displayName}
                      size={44}
                      className="shrink-0"
                    />
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

              {/* Image, bio, contact – behind BlurGate when no subscription */}
              <BlurGate
                isAllowed={viewerHasAccess}
                className="relative min-h-48 flex-1"
                upgradeHref="/pricing"
              >
                <div className="relative h-48 w-full">
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
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-emerald-950/60 text-xs uppercase tracking-[0.3em] text-zinc-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
                  <p className="text-sm text-zinc-400">
                    {escort.bio ?? "Premium experience with verified photos."}
                  </p>
                  {escort.canShowContact && escort.contact ? (
                    <div className="mt-auto text-sm text-zinc-300">
                      <p>{escort.contact.phone ?? "Phone on request"}</p>
                      {escort.contact.telegram ? (
                        <p>Telegram: {escort.contact.telegram}</p>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-auto rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                      Upgrade to view contact details
                    </div>
                  )}
                </div>
              </BlurGate>

              <div className="flex flex-col gap-2 border-t border-zinc-800 p-4 sm:p-6">
                <ButtonLink
                  href={`/profiles/${escort.id}`}
                  className="w-full"
                >
                  View profile
                </ButtonLink>
                <ButtonLink
                  href={`/escorts/${escort.id}`}
                  variant="outline"
                  className="w-full"
                >
                  Full details
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
