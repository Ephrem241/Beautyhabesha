import "server-only";
import { prisma } from "@/lib/db";
import { cursorPageResult } from "@/lib/pagination";

const DEFAULT_TAKE = 50;
const MAX_TAKE = 100;

export type PaymentsCursorResult = {
  items: Awaited<ReturnType<typeof listPaymentsCursor>>["items"];
  nextCursor: string | null;
};

export async function listPaymentsCursor(options?: {
  cursor?: string;
  take?: number;
  status?: "pending" | "approved" | "rejected";
}) {
  const take = Math.min(options?.take ?? DEFAULT_TAKE, MAX_TAKE);
  const status = options?.status ?? "pending";
  const rawTake = take + 1;

  const rows = await prisma.payment.findMany({
    where: { status },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: rawTake,
    cursor: options?.cursor ? { id: options.cursor } : undefined,
    include: {
      user: { select: { name: true, email: true, username: true } },
      plan: { select: { name: true } },
    },
  });

  return cursorPageResult(rows, take);
}

export type SubscriptionsCursorResult = {
  items: Awaited<ReturnType<typeof listSubscriptionsCursor>>["items"];
  nextCursor: string | null;
};

export async function listSubscriptionsCursor(options?: {
  cursor?: string;
  take?: number;
  status?: string;
}) {
  const take = Math.min(options?.take ?? DEFAULT_TAKE, MAX_TAKE);
  const status = options?.status ?? "pending";
  const rawTake = take + 1;

  const rows = await prisma.subscription.findMany({
    where: { status },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: rawTake,
    cursor: options?.cursor ? { id: options.cursor } : undefined,
    include: {
      user: { select: { name: true, email: true, username: true } },
      subscriptionPlan: { select: { name: true } },
    },
  });

  return cursorPageResult(rows, take);
}

export type UsersCursorResult = {
  items: Awaited<ReturnType<typeof listUsersCursor>>["items"];
  nextCursor: string | null;
};

export async function listUsersCursor(options?: { cursor?: string; take?: number }) {
  const take = Math.min(options?.take ?? DEFAULT_TAKE, MAX_TAKE);
  const rawTake = take + 1;

  const rows = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      role: true,
      currentPlan: true,
      autoRenew: true,
      renewalAttempts: true,
      lastRenewalAttempt: true,
      bannedAt: true,
      createdAt: true,
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: rawTake,
    cursor: options?.cursor ? { id: options.cursor } : undefined,
  });

  return cursorPageResult(rows, take);
}
