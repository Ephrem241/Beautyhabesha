"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BrowseFilters } from "@/lib/browse-filters";

type FilterDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  cities: string[];
  filters: BrowseFilters;
  onUpdate: (updates: Partial<BrowseFilters>) => void;
  onReset: () => void;
};

const PRICE_MIN = 0;
const PRICE_MAX = 10000;
const AGE_MIN = 18;
const AGE_MAX = 99;

export function FilterDrawer({
  isOpen,
  onClose,
  cities,
  filters,
  onUpdate,
  onReset,
}: FilterDrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl border-t border-zinc-800 bg-zinc-950 pb-[env(safe-area-inset-bottom,0)]"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-4">
              <h2 className="text-lg font-semibold text-white">Filters</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-6 p-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  City
                </label>
                <select
                  value={filters.city ?? ""}
                  onChange={(e) =>
                    onUpdate({ city: e.target.value || undefined })
                  }
                  className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none"
                >
                  <option value="">All cities</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Price range (ETB)
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    value={filters.minPrice ?? ""}
                    onChange={(e) => {
                      const v = e.target.value
                        ? parseInt(e.target.value, 10)
                        : undefined;
                      onUpdate({ minPrice: v });
                    }}
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
                  />
                  <span className="text-zinc-500">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    value={filters.maxPrice ?? ""}
                    onChange={(e) => {
                      const v = e.target.value
                        ? parseInt(e.target.value, 10)
                        : undefined;
                      onUpdate({ maxPrice: v });
                    }}
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300">
                  Age range
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    min={AGE_MIN}
                    max={AGE_MAX}
                    value={filters.minAge ?? ""}
                    onChange={(e) => {
                      const v = e.target.value
                        ? parseInt(e.target.value, 10)
                        : undefined;
                      onUpdate({ minAge: v });
                    }}
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
                  />
                  <span className="text-zinc-500">–</span>
                  <input
                    type="number"
                    placeholder="Max"
                    min={AGE_MIN}
                    max={AGE_MAX}
                    value={filters.maxAge ?? ""}
                    onChange={(e) => {
                      const v = e.target.value
                        ? parseInt(e.target.value, 10)
                        : undefined;
                      onUpdate({ maxAge: v });
                    }}
                    className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-emerald-500/50 focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3">
                <input
                  type="checkbox"
                  checked={filters.available === true}
                  onChange={(e) =>
                    onUpdate({
                      available: e.target.checked ? true : undefined,
                    })
                  }
                  className="h-4 w-4 rounded border-zinc-600 accent-emerald-500"
                />
                <span className="text-sm text-zinc-300">Available now</span>
              </label>
            </div>

            <div className="flex gap-3 border-t border-zinc-800 p-4">
              <button
                type="button"
                onClick={onReset}
                className="flex-1 rounded-xl border border-zinc-600 py-3 text-sm font-semibold text-zinc-300 hover:bg-zinc-800"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
