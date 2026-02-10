import type { Metadata } from "next";
import Link from "next/link";
import type { PlanId } from "@/lib/plans";
import { getAuthSession } from "@/lib/auth";
import { getPublicEscortsOptimized } from "@/lib/escorts";
import { getViewerHasActiveSubscription } from "@/lib/viewer-access";
import { withCache } from "@/lib/cache";
import { ButtonLink } from "@/app/_components/ui/Button";
import { BlurGate } from "@/app/_components/BlurGate";
import { Breadcrumbs } from "@/app/_components/Breadcrumbs";
import { PlanBadge } from "@/app/_components/PlanBadge";
import { ProfileAvatar } from "@/app/_components/ProfileAvatar";
import { ProtectedEscortImage } from "@/app/_components/ProtectedEscortImage";
import { DEFAULT_ESCORT_TELEGRAM, DEFAULT_ESCORT_WHATSAPP } from "@/lib/escort-defaults";

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

function buildTelegramUrl(username: string): string {
  const s = username.replace(/^@/, "").trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://t.me/${encodeURIComponent(s)}`;
}

function buildWhatsAppUrl(num: string): string {
  const digits = num.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export const metadata: Metadata = {
  title: "Model Listings",
  description: "Browse premium model profiles by membership visibility.",
  alternates: { canonical: "/escorts" },
  openGraph: {
    title: "Model Listings • Beautyhabesha",
    description: "Browse premium model profiles by membership visibility.",
    type: "website",
    url: "/escorts",
  },
  twitter: { card: "summary_large_image", title: "Model Listings • Beautyhabesha" },
};

export default async function EscortListingPage() {
  const session = await getAuthSession();
  const viewerUserId = session?.user?.id ?? null;
  const viewerHasAccess = await getViewerHasActiveSubscription(viewerUserId);
  const escorts = await withCache(
    `public-escorts:${viewerUserId ?? "anon"}`,
    () => getPublicEscortsOptimized({ viewerUserId }),
    { revalidate: 60 }
  );

  return (
    <div className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Models" }]} />
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Model listings
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
                      greenRing
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
                <div className="mt-2 flex items-center justify-center gap-2 pt-2 border-t border-zinc-800/50">
                  <span className="text-xs text-zinc-500">Contact admin:</span>
                  <div className="flex gap-2">
                    {buildTelegramUrl(DEFAULT_ESCORT_TELEGRAM) && (
                      <a
                        href={buildTelegramUrl(DEFAULT_ESCORT_TELEGRAM)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0088cc] text-white shadow-md transition hover:scale-110 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0088cc] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        aria-label="Contact admin on Telegram"
                        title={DEFAULT_ESCORT_TELEGRAM}
                      >
                        <TelegramIcon className="h-5 w-5" />
                      </a>
                    )}
                    {buildWhatsAppUrl(DEFAULT_ESCORT_WHATSAPP) && (
                      <a
                        href={buildWhatsAppUrl(DEFAULT_ESCORT_WHATSAPP)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#25D366] text-white shadow-md transition hover:scale-110 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                        aria-label="Contact admin on WhatsApp"
                        title={DEFAULT_ESCORT_WHATSAPP}
                      >
                        <WhatsAppIcon className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
