import "server-only";

import { prisma } from "@/lib/db";

export async function getBrowseCities(): Promise<string[]> {
  const rows = await prisma.escortProfile.findMany({
    where: { status: "approved", city: { not: null } },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  });
  return rows
    .map((r) => r.city)
    .filter((c): c is string => Boolean(c?.trim()))
    .sort((a, b) => a.localeCompare(b));
}
