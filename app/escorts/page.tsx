import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";
import { getBrowseProfilesFiltered, getPublicEscortsOptimized } from "@/lib/escorts";
import { getViewerHasActiveSubscription } from "@/lib/viewer-access";
import { countActiveFilters } from "@/lib/browse-filters";
import { getBrowseCities } from "@/lib/browse-filters-server";
import { withCache } from "@/lib/cache";
import { Breadcrumbs } from "@/app/_components/Breadcrumbs";
import { ModelsContent } from "./_components/ModelsContent";
import { GridView } from "./_components/GridView";
import type { BrowseFilters } from "@/lib/browse-filters";

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

function parseFilters(params: Record<string, string | undefined>): BrowseFilters {
  const filters: BrowseFilters = {};
  if (params.online === "true") filters.online = true;
  if (params.search?.trim()) filters.search = params.search.trim();
  if (params.city?.trim()) filters.city = params.city.trim();
  const minAge = params.minAge ? parseInt(params.minAge, 10) : undefined;
  if (minAge != null && !Number.isNaN(minAge)) filters.minAge = minAge;
  const maxAge = params.maxAge ? parseInt(params.maxAge, 10) : undefined;
  if (maxAge != null && !Number.isNaN(maxAge)) filters.maxAge = maxAge;
  if (params.available === "true") filters.available = true;
  return filters;
}

function cacheKeyFromFilters(viewerUserId: string | null, filters: BrowseFilters): string {
  const parts = [viewerUserId ?? "anon"];
  if (filters.online) parts.push("online");
  if (filters.search) parts.push(`s:${filters.search}`);
  if (filters.city) parts.push(`c:${filters.city}`);
  if (filters.minAge != null) parts.push(`min:${filters.minAge}`);
  if (filters.maxAge != null) parts.push(`max:${filters.maxAge}`);
  if (filters.available) parts.push("avail");
  return `public-escorts:${parts.join(":")}`;
}

type EscortListingPageProps = {
  searchParams: Promise<{
    online?: string;
    search?: string;
    city?: string;
    minAge?: string;
    maxAge?: string;
    available?: string;
  }>;
};

export default async function EscortListingPage({ searchParams }: EscortListingPageProps) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const hasActiveFilters = countActiveFilters(filters) > 0;

  const session = await getAuthSession();
  const viewerUserId = session?.user?.id ?? null;
  const viewerHasAccess = await getViewerHasActiveSubscription(viewerUserId);
  const [cities, escorts] = await Promise.all([
    getBrowseCities(),
    withCache(
      cacheKeyFromFilters(viewerUserId, filters),
      () =>
        hasActiveFilters
          ? getBrowseProfilesFiltered({ viewerUserId, filters })
          : getPublicEscortsOptimized({ viewerUserId }),
      { revalidate: hasActiveFilters ? 30 : 60 }
    ),
  ]);

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
          </div>
        </header>

        <ModelsContent
          escorts={escorts}
          viewerHasAccess={viewerHasAccess}
          filters={filters}
          cities={cities}
          gridViewContent={<GridView escorts={escorts} viewerHasAccess={viewerHasAccess} />}
        />
      </div>
    </div>
  );
}
