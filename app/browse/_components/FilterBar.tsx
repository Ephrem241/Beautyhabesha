"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { BrowseFilters } from "@/lib/browse-filters";

type FilterBarProps = {
  cities: string[];
  filters: BrowseFilters;
  activeCount: number;
  onOpenDrawer?: () => void;
};

const AGE_MIN = 18;
const AGE_MAX = 99;
const SEARCH_DEBOUNCE_MS = 300;

export function FilterBar({
  cities,
  filters,
  activeCount,
  onOpenDrawer,
}: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    queueMicrotask(() => setSearchInput(filters.search ?? ""));
  }, [filters.search]);

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

  useEffect(() => {
    if (searchInput === (filters.search ?? "")) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const current = searchInput.trim() || undefined;
      if (current !== (filters.search ?? "")) {
        updateParams({ search: current });
      }
      debounceRef.current = null;
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput, filters.search, updateParams]);

  const reset = useCallback(() => {
    router.push(pathname, { scroll: false });
    setSearchInput("");
  }, [pathname, router]);

  return (
    <div className="sticky top-0 z-30 rounded-b-2xl border-b border-zinc-800/80 bg-black/80 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <input
              type="search"
              placeholder="Search by name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
            />
          </div>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={reset}
              className="shrink-0 rounded-xl border border-zinc-600 px-3 py-2 text-xs font-medium text-zinc-400 hover:border-zinc-500 hover:text-white"
            >
              Reset
            </button>
          )}
        </div>

        <div className="hidden flex-wrap items-center gap-2 md:flex">
          <select
            value={filters.city ?? ""}
            onChange={(e) =>
              updateParams({ city: e.target.value || undefined })
            }
            className="rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2 text-sm text-white focus:border-emerald-500/50 focus:outline-none"
          >
            <option value="">All cities</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2">
            <input
              type="number"
              placeholder="Min"
              min={AGE_MIN}
              max={AGE_MAX}
              value={filters.minAge ?? ""}
              onChange={(e) => {
                const v = e.target.value ? parseInt(e.target.value, 10) : undefined;
                updateParams({ minAge: v });
              }}
              className="w-14 rounded border-0 bg-transparent text-sm text-white placeholder-zinc-500 focus:ring-0"
            />
            <span className="text-zinc-500">–</span>
            <input
              type="number"
              placeholder="Max"
              min={AGE_MIN}
              max={AGE_MAX}
              value={filters.maxAge ?? ""}
              onChange={(e) => {
                const v = e.target.value ? parseInt(e.target.value, 10) : undefined;
                updateParams({ maxAge: v });
              }}
              className="w-14 rounded border-0 bg-transparent text-sm text-white placeholder-zinc-500 focus:ring-0"
            />
            <span className="text-xs text-zinc-500">age</span>
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-3 py-2">
            <input
              type="checkbox"
              checked={filters.available === true}
              onChange={(e) =>
                updateParams({ available: e.target.checked ? true : undefined })
              }
              className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
            />
            <span className="text-sm text-zinc-300">Available now</span>
          </label>
        </div>

        <div className="flex items-center justify-between md:hidden">
          <button
            type="button"
            onClick={onOpenDrawer}
            className="flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-300"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filters
            {activeCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-medium text-emerald-400">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
