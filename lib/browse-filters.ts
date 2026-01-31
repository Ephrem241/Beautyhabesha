import type { Prisma } from "@prisma/client";

export type BrowseFilters = {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  minAge?: number;
  maxAge?: number;
  available?: boolean;
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

  if (filters.minPrice != null || filters.maxPrice != null) {
    where.price = {};
    if (filters.minPrice != null) {
      (where.price as Prisma.IntFilter).gte = filters.minPrice;
    }
    if (filters.maxPrice != null) {
      (where.price as Prisma.IntFilter).lte = filters.maxPrice;
    }
  }

  if (filters.available === true) {
    where.available = true;
  }

  if (filters.search?.trim()) {
    where.displayName = {
      contains: filters.search.trim(),
      mode: "insensitive",
    };
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
  if (f.minPrice != null) n++;
  if (f.maxPrice != null) n++;
  if (f.minAge != null) n++;
  if (f.maxAge != null) n++;
  if (f.available === true) n++;
  if (f.search?.trim()) n++;
  return n;
}
