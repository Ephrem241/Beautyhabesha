"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { PublicEscort } from "@/lib/escorts";
import type { BrowseFilters } from "@/lib/browse-filters";
import { countActiveFilters } from "@/lib/browse-filters";
import { FilterBar } from "./FilterBar";
import { FilterDrawer } from "./FilterDrawer";
import { SwipeDeck } from "./SwipeDeck";

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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
          profiles={profiles}
          hasActiveSubscription={hasActiveSubscription}
        />
      </div>
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
