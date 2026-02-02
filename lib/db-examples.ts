/**
 * Production query patterns and best practices.
 * Use these patterns for fast, scalable Prisma usage with Neon.
 *
 * MIGRATION COMMANDS:
 *   npx prisma migrate dev --name <name>   # dev: create and apply
 *   npx prisma migrate deploy              # prod: apply pending
 *   npx prisma generate                   # regenerate client after schema change
 */

import { prisma } from "@/lib/db";
import { withCache } from "@/lib/cache";
import { cursorPageResult } from "@/lib/pagination";

// ---------------------------------------------------------------------------
// 1) Optimized findMany with select + cursor pagination
// ---------------------------------------------------------------------------

export async function exampleCursorPaginatedProfiles(cursor?: string, take = 20) {
  const rawTake = take + 1;
  const rows = await prisma.escortProfile.findMany({
    where: { status: "approved" },
    select: {
      id: true,
      displayName: true,
      city: true,
      images: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: rawTake,
    cursor: cursor ? { id: cursor } : undefined,
  });
  return cursorPageResult(rows, take);
}

// ---------------------------------------------------------------------------
// 2) Cached public data with withCache (revalidate every 60s)
// ---------------------------------------------------------------------------

export async function exampleCachedProfiles() {
  return withCache(
    "public-profiles:v1",
    () =>
      prisma.escortProfile.findMany({
        where: { status: "approved" },
        select: { id: true, displayName: true, city: true, createdAt: true },
        take: 50,
        orderBy: { createdAt: "desc" },
      }),
    { revalidate: 60 }
  );
}

// ---------------------------------------------------------------------------
// 3) Transaction for payment + subscription (atomic)
// ---------------------------------------------------------------------------

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export async function examplePaymentAndSubscription(
  userId: string,
  planId: string,
  paymentProofUrl: string
) {
  await prisma.$transaction(async (tx: TransactionClient) => {
    await tx.payment.create({
      data: {
        userId,
        planId,
        amount: 0,
        receiptUrl: paymentProofUrl,
        paymentMethod: "telebirr",
        status: "pending",
      },
    });
    await tx.subscription.create({
      data: {
        userId,
        planId,
        status: "pending",
        paymentMethod: "telebirr",
        paymentProofUrl,
        paymentProofPublicId: "",
      },
    });
  });
}
