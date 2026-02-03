import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { getPublicEscortById, getEscortMetadataForSeo } from "@/lib/escorts";
import { getViewerHasActiveSubscription } from "@/lib/viewer-access";
import { getSiteUrl } from "@/lib/site-url";
import { BlurGate } from "@/app/_components/BlurGate";
import { Breadcrumbs } from "@/app/_components/Breadcrumbs";
import { TelegramButton } from "@/app/_components/TelegramButton";
import { PlanBadge } from "@/app/_components/PlanBadge";
import { ProfileAvatar } from "@/app/_components/ProfileAvatar";
import { ProtectedEscortImage } from "@/app/_components/ProtectedEscortImage";
import { BookButton } from "./_components/BookButton";
import { ReportProfileButton } from "./_components/ReportProfileButton";

type EscortDetailPageProps = {
  params: Promise<{ id: string }>;
};

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3).trimEnd() + "...";
}

export async function generateMetadata({
  params,
}: EscortDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const meta = await getEscortMetadataForSeo(id);
  if (!meta) return { title: "Profile not found" };

  const title = meta.displayName;
  const desc = truncate(
    meta.bio || `${meta.displayName}${meta.city ? ` • ${meta.city}` : ""} • Premium profile on Beautyhabesha`,
    160
  );
  const base = getSiteUrl();
  const canonical = `${base}/profiles/${id}`;
  const ogImage = meta.image
    ? { url: meta.image, width: 800, height: 600, alt: meta.displayName }
    : undefined;

  return {
    title,
    description: desc,
    alternates: { canonical },
    openGraph: {
      title: `${meta.displayName} • Beautyhabesha`,
      description: desc,
      type: "profile",
      url: canonical,
      images: ogImage ? [ogImage] : undefined,
      siteName: "Beautyhabesha",
    },
    twitter: {
      card: "summary_large_image",
      title: `${meta.displayName} • Beautyhabesha`,
      description: desc,
      images: meta.image ? [meta.image] : undefined,
    },
  };
}

export default async function EscortDetailPage({ params }: EscortDetailPageProps) {
  const { id } = await params;
  const session = await getAuthSession();
  const viewerUserId = session?.user?.id ?? null;
  const viewerHasAccess = await getViewerHasActiveSubscription(viewerUserId);
  const escort = await getPublicEscortById(id, { viewerUserId });

  if (!escort) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-3">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Escorts", href: "/escorts" },
              { label: escort.displayName },
            ]}
          />
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Escort profile
          </p>
          <div className="flex items-center gap-4">
            <ProfileAvatar
              src={escort.images[0]}
              alt={escort.displayName}
              size={56}
              className="shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold sm:text-3xl truncate">
                {escort.displayName}
              </h1>
              <p className="text-sm text-zinc-400">
                {escort.city ?? "Available for premium bookings"}
              </p>
            </div>
          </div>
        </header>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/80 px-4 py-3 text-center text-xs text-zinc-500">
          This platform does not provide escort services. All arrangements are
          between consenting adults.
        </div>

        <BlurGate
          isAllowed={viewerHasAccess}
          className="mt-6 min-h-80 rounded-2xl border border-zinc-800 sm:mt-8 sm:rounded-3xl"
          upgradeHref="/pricing"
        >
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:gap-8">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:rounded-3xl sm:p-6">
              <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                {escort.images.length > 0 ? (
                  escort.images.map((image, idx) => (
                    <div
                      key={image}
                      className="relative h-48 overflow-hidden rounded-2xl"
                    >
                      <ProtectedEscortImage
                        src={image}
                        alt={idx === 0 ? escort.displayName : `${escort.displayName} photo ${idx + 1}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                        allowFullQuality={viewerHasAccess}
                        displayName={escort.displayName}
                        escortId={escort.id}
                        showWarningOverlay
                        priority={idx === 0}
                      />
                    </div>
                  ))
                ) : (
                  <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-zinc-800 text-xs uppercase tracking-[0.3em] text-zinc-500">
                    No images
                  </div>
                )}
              </div>
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-white">About</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {escort.bio ??
                    "Exclusive companionship with verified photos and premium service."}
                </p>
              </div>
            </section>

            <aside className="rounded-2xl border border-zinc-800 bg-black p-4 sm:rounded-3xl sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
                Contact details
              </p>
              {escort.canShowContact && escort.contact ? (
                <div className="mt-4 space-y-3 text-sm text-zinc-300">
                  <p>{escort.contact.phone ?? "Phone on request"}</p>
                  {escort.contact.telegram ? (
                    <p>Telegram: {escort.contact.telegram}</p>
                  ) : null}
                  {escort.contact.whatsapp ? (
                    <p>WhatsApp: {escort.contact.whatsapp}</p>
                  ) : null}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                  Upgrade to view contact details
                </div>
              )}

              <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                <PlanBadge planId={escort.planId} showFeatured showBenefits />
              </div>
              <a
                href={`/escorts/${escort.id}/availability`}
                className="mt-4 block w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-center text-sm text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-300"
              >
                View availability calendar
              </a>
              <BookButton
                escortId={escort.id}
                displayName={escort.displayName}
                defaultDepositAmount={500}
                isLoggedIn={Boolean(session?.user?.id)}
              />
            </aside>
          </div>
        </BlurGate>

        <div className="mt-4 flex justify-end">
          <ReportProfileButton
            escortId={escort.id}
            escortName={escort.displayName}
            isLoggedIn={Boolean(session?.user?.id)}
          />
        </div>

        <TelegramButton
          telegram={escort.telegram}
          locked={!viewerHasAccess || !escort.canShowContact}
        />
      </div>
    </div>
  );
}
