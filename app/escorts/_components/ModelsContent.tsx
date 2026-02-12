"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import type { PublicEscort } from "@/lib/escorts";
import type { BrowseFilters } from "@/lib/browse-filters";
import { countActiveFilters } from "@/lib/browse-filters";
import { ViewSwitcher, type ViewMode } from "@/app/_components/ViewSwitcher";
import { FilterBar } from "@/app/browse/_components/FilterBar";
import { FilterDrawer } from "@/app/browse/_components/FilterDrawer";
import { mapPublicEscortToProfile } from "@/app/browse/_components/mapProfile";
import { SkeletonCardStack } from "@/app/_components/ui/SkeletonCard";

const SwipeDeck = dynamic(
  () => import("@/app/_components/swipe/SwipeDeck").then((m) => m.SwipeDeck),
  { loading: () => <div className="min-h-0 flex-1 flex items-center justify-center px-4"><SkeletonCardStack /></div> }
);

type ModelsContentProps = {
  escorts: PublicEscort[];
  viewerHasAccess: boolean;
  filters: BrowseFilters;
  cities: string[];
  gridViewContent: React.ReactNode;
};

export function ModelsContent({
  escorts,
  viewerHasAccess: _viewerHasAccess,
  filters,
  cities,
  gridViewContent,
}: ModelsContentProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParams = useCallback(
    (updates: Partial<BrowseFilters>) => {
      const next = new URLSearchParams(searchParams.toString());
      const apply = (key: string, val: string | number | boolean | undefined) => {
        if (val === undefined || val === "" || val === false) next.delete(key);
        else next.set(key, String(val));
      };
      if ("city" in updates) apply("city", updates.city);
      if ("minAge" in updates) apply("minAge", updates.minAge);
      if ("maxAge" in updates) apply("maxAge", updates.maxAge);
      if ("available" in updates) apply("available", updates.available);
      if ("online" in updates) apply("online", updates.online);
      router.push(`/escorts?${next.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const swipeProfiles = useMemo(
    () => escorts.map(mapPublicEscortToProfile),
    [escorts]
  );

  const activeCount = countActiveFilters(filters);

  const handleViewProfile = useCallback(
    (profile: { id: string }) => {
      router.push(`/profiles/${profile.id}`);
    },
    [router]
  );

  return (
    <>
      {/* FilterBar: search, city, age, available, online */}
      <FilterBar
        cities={cities}
        filters={filters}
        activeCount={activeCount}
        onOpenDrawer={() => setDrawerOpen(true)}
      />

      {/* View Switcher */}
      <div className="mt-4 flex justify-end">
        <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
      </div>

      {/* Content Area */}
      <div id="models-content" role="tabpanel" className="mt-6 sm:mt-8">
        {viewMode === "grid" ? (
          gridViewContent
        ) : (
          <div className="fixed inset-0 top-[calc(3.5rem+env(safe-area-inset-top,0))] sm:top-[calc(4rem+env(safe-area-inset-top,0))] z-40 flex flex-col bg-black">
            <SwipeDeck
              profiles={swipeProfiles}
              onViewProfile={handleViewProfile}
            />
          </div>
        )}
      </div>

      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cities={cities}
        filters={filters}
        onUpdate={updateParams}
        onReset={() => router.push("/escorts", { scroll: false })}
      />
    </>
  );
}

