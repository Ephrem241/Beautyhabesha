import type { Metadata } from "next";
import { Suspense } from "react";
import { getAuthSession } from "@/lib/auth";
import { getBrowseProfiles } from "@/lib/escorts";
import { getViewerHasActiveSubscription } from "@/lib/viewer-access";
import { getBrowseCities } from "@/lib/browse-filters-server";
import { SwipeDeck } from "./_components/SwipeDeck";
import { BrowseContent } from "./_components/BrowseContent";

export const metadata: Metadata = {
  title: "Browse",
  description: "Swipe through premium profiles.",
  alternates: { canonical: "/browse" },
};

type BrowsePageProps = {
  searchParams: Promise<{
    city?: string;
    minAge?: string;
    maxAge?: string;
    available?: string;
    search?: string;
  }>;
};

function parseFilters(
  params: Awaited<BrowsePageProps["searchParams"]>
): import("@/lib/browse-filters").BrowseFilters {
  return {
    city: params.city?.trim() || undefined,
    minAge: params.minAge != null ? parseInt(params.minAge, 10) : undefined,
    maxAge: params.maxAge != null ? parseInt(params.maxAge, 10) : undefined,
    available:
      params.available === "true" || params.available === "1"
        ? true
        : undefined,
    search: params.search?.trim() || undefined,
  };
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);

  const session = await getAuthSession();
  const viewerUserId = session?.user?.id ?? null;
  const hasActiveSubscription =
    await getViewerHasActiveSubscription(viewerUserId);
  const [profiles, cities] = await Promise.all([
    getBrowseProfiles({ viewerUserId, filters }),
    getBrowseCities(),
  ]);

  return (
    <div className="fixed inset-0 top-16 flex flex-col bg-black">
      <Suspense fallback={<div className="h-14 shrink-0" />}>
        <BrowseContent
          profiles={profiles}
          hasActiveSubscription={hasActiveSubscription}
          cities={cities}
          filters={filters}
        />
      </Suspense>
    </div>
  );
}
