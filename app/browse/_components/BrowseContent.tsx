"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { PublicEscort } from "@/lib/escorts";
import type { BrowseFilters } from "@/lib/browse-filters";
import { countActiveFilters } from "@/lib/browse-filters";
import { FilterBar } from "./FilterBar";
import { FilterDrawer } from "./FilterDrawer";
import { TelegramButton } from "@/app/_components/TelegramButton";
import { mapPublicEscortToProfile } from "./mapProfile";
import { SkeletonCardStack } from "@/app/_components/ui/SkeletonCard";

const SwipeDeck = dynamic(
  () => import("@/app/_components/swipe/SwipeDeck").then((m) => m.SwipeDeck),
  { loading: () => <div className="min-h-0 flex-1 flex items-center justify-center px-4"><SkeletonCardStack /></div> }
);

type BrowseContentProps = {
  profiles: PublicEscort[];
  hasActiveSubscription: boolean;
  cities: string[];
  filters: BrowseFilters;
};

export function BrowseContent({
  profiles,
  hasActiveSubscription,
  cities,
  filters,
}: BrowseContentProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const swipeProfiles = useMemo(
    () => profiles.map(mapPublicEscortToProfile),
    [profiles]
  );

  const currentPublicProfile = profiles[currentIndex] ?? null;
  const canShowContact =
    hasActiveSubscription && (currentPublicProfile?.canShowContact ?? false);

  const activeCount = countActiveFilters(filters);

  const updateParams = useCallback(
    (updates: Partial<BrowseFilters>) => {
      const next = new URLSearchParams(searchParams.toString());
      const apply = (key: string, val: string | number | boolean | undefined) => {
        if (val === undefined || val === "" || val === false) {
          next.delete(key);
        } else {
          next.set(key, String(val));
        }
      };
      if ("city" in updates) apply("city", updates.city);
      if ("minAge" in updates) apply("minAge", updates.minAge);
      if ("maxAge" in updates) apply("maxAge", updates.maxAge);
      if ("available" in updates) apply("available", updates.available);
      if ("search" in updates) apply("search", updates.search);
      router.push(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const reset = useCallback(() => {
    router.push(pathname, { scroll: false });
    setDrawerOpen(false);
  }, [pathname, router]);

  const handleViewProfile = useCallback(
    (profile: { id: string }) => {
      router.push(`/profiles/${profile.id}`);
    },
    [router]
  );

  return (
    <>
      <FilterBar
        cities={cities}
        filters={filters}
        activeCount={activeCount}
        onOpenDrawer={() => setDrawerOpen(true)}
      />
      <div className="min-h-0 flex-1">
        <SwipeDeck
          profiles={swipeProfiles}
          onViewProfile={handleViewProfile}
          onIndexChange={setCurrentIndex}
        />
      </div>
      {currentPublicProfile && (
        <TelegramButton
          telegram={currentPublicProfile.telegram}
          locked={!canShowContact}
        />
      )}
      <FilterDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cities={cities}
        filters={filters}
        onUpdate={updateParams}
        onReset={reset}
      />
    </>
  );
}
