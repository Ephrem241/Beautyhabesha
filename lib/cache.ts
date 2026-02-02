import { unstable_cache } from "next/cache";

/**
 * Revalidation helpers and cached data fetchers.
 * Use unstable_cache for public data that can be revalidated on an interval.
 */

const DEFAULT_REVALIDATE_SECONDS = 60;

export type CacheOptions = {
  revalidate?: number;
  tags?: string[];
};

/**
 * Wraps a fetcher with Next.js unstable_cache for ISR.
 * Use for public listing data (escorts, browse, featured) where consistency can lag by revalidate seconds.
 */
export function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const { revalidate = DEFAULT_REVALIDATE_SECONDS, tags = [] } = options;
  return unstable_cache(fetcher, key.split(":"), { revalidate, tags })();
}
