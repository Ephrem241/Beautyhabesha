import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { getPublicEscortById, getEscortMetadataForSeo } from "@/lib/escorts";
import { getViewerHasActiveSubscription } from "@/lib/viewer-access";
import { getSiteUrl } from "@/lib/site-url";

import { ProfileDetailView } from "./_components/ProfileDetailView";

type ProfileDetailPageProps = {
  params: Promise<{ id: string }>;
};

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 3).trimEnd() + "...";
}

export async function generateMetadata({
  params,
}: ProfileDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const meta = await getEscortMetadataForSeo(id);
  if (!meta) return { title: "Profile not found" };

  const title = meta.displayName;
  const desc = truncate(
    meta.bio || `${meta.displayName}${meta.city ? ` • ${meta.city}` : ""} • Premium profile`,
    160
  );
  const base = getSiteUrl();
  const canonical = `${base}/profiles/${id}`;
  const ogImage = meta.image
    ? { url: meta.image, width: 800, height: 1000, alt: meta.displayName }
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

export default async function ProfileDetailPage({
  params,
}: ProfileDetailPageProps) {
  const { id } = await params;
  const session = await getAuthSession();
  const viewerUserId = session?.user?.id ?? null;
  const viewerHasAccess = await getViewerHasActiveSubscription(viewerUserId);
  const profile = await getPublicEscortById(id, { viewerUserId });

  if (!profile) {
    notFound();
  }

  return (
    <ProfileDetailView
      profile={profile}
      hasActiveSubscription={viewerHasAccess}
      upgradeHref="/pricing"
    />
  );
}
