import type { Prisma } from "@prisma/client";
import { ONLINE_THRESHOLD_MINUTES } from "@/lib/online-status";

export type BrowseFilters = {
  city?: string;
  minAge?: number;
  maxAge?: number;
  available?: boolean;
  online?: boolean;
  search?: string;
};

export function buildBrowseWhere(
  filters: BrowseFilters
): Prisma.EscortProfileWhereInput {
  const where: Prisma.EscortProfileWhereInput = {
    status: "approved",
  };

  if (filters.city?.trim()) {
    where.city = {
      contains: filters.city.trim(),
      mode: "insensitive",
    };
  }

  if (filters.available === true) {
    where.available = true;
  }

  if (filters.online === true) {
    const cutoff = new Date(
      Date.now() - ONLINE_THRESHOLD_MINUTES * 60 * 1000
    );
    where.lastActiveAt = { gte: cutoff };
  }

  if (filters.search?.trim()) {
    const q = filters.search.trim();
    where.OR = [
      { displayName: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
      { bio: { contains: q, mode: "insensitive" } },
    ];
  }

  if (filters.minAge != null || filters.maxAge != null) {
    const ageFilter: Prisma.IntNullableFilter = {};
    if (filters.minAge != null) ageFilter.gte = filters.minAge;
    if (filters.maxAge != null) ageFilter.lte = filters.maxAge;
    where.user = { age: ageFilter };
  }

  return where;
}

export function countActiveFilters(f: BrowseFilters): number {
  let n = 0;
  if (f.city?.trim()) n++;
  if (f.minAge != null) n++;
  if (f.maxAge != null) n++;
  if (f.available === true) n++;
  if (f.online === true) n++;
  if (f.search?.trim()) n++;
  return n;
}
