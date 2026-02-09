import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";
import { getFeaturedEscorts } from "@/lib/escorts";
import { getViewerHasActiveSubscription } from "@/lib/viewer-access";
import { ButtonLink } from "@/app/_components/ui/Button";
import { HeroTextCarousel } from "@/app/_components/HeroTextCarousel";
import { HeroBackgroundCarousel } from "@/app/_components/HeroBackgroundCarousel";
import { ProfileAvatar } from "@/app/_components/ProfileAvatar";
import { ProtectedEscortImage } from "@/app/_components/ProtectedEscortImage";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover premium escort profiles with Platinum spotlight placement.",
};

export default async function Home() {
  const session = await getAuthSession();
  const viewerUserId = session?.user?.id ?? null;
  const viewerHasAccess = await getViewerHasActiveSubscription(viewerUserId);
  const spotlight = await getFeaturedEscorts(6, { viewerUserId });

  return (
    <div className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <section className="relative mb-8 min-h-[280px] overflow-hidden rounded-2xl border border-zinc-800 sm:min-h-[320px] sm:rounded-3xl">
          <HeroBackgroundCarousel
            imageUrls={spotlight.map((e) => e.images[0]).filter(Boolean) as string[]}
            intervalMs={5000}
          />
          <div className="absolute inset-0 z-1 bg-black/50" aria-hidden />
          <div className="relative z-10 flex min-h-[280px] items-center sm:min-h-[320px]">
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
              Browse escorts
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
          {spotlight.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
              No Platinum profiles yet. Upgrade to appear here.
            </div>
          ) : (
            <div className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {spotlight.slice(0, 6).map((escort, idx) => (
                <article
                  key={escort.id}
                  className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition hover:-translate-y-0.5 hover:border-emerald-500/60 sm:rounded-3xl"
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
                      <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-900 via-black to-emerald-950/60 text-xs uppercase tracking-[0.3em] text-zinc-500">
                        No image
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
                      Featured
                    </span>
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-3">
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
                    <p className="mt-3 text-sm text-zinc-400">
                      {escort.bio ?? "Premium spotlight profile."}
                    </p>
                    <ButtonLink
                      href={`/profiles/${escort.id}`}
                      variant="ghost"
                      className="mt-4"
                    >
                      View profile
                    </ButtonLink>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
