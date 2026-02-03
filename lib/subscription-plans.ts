import { prisma } from "@/lib/db";
import type { BillingCycle } from "@prisma/client";
import {
  formatPrice as formatPriceFromUtil,
  formatDurationDays as formatDurationDaysFromUtil,
} from "@/lib/plan-format";

export type SubscriptionPlanDoc = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  features: string[];
  durationDays: number;
  isPopular: boolean;
  isRecommended: boolean;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const PLAN_LIST_WHERE = {
  isActive: true,
  deletedAt: null,
} as const;

export async function getActiveSubscriptionPlans(): Promise<SubscriptionPlanDoc[]> {
  const maxAttempts = 3;
  let attempt = 0;
  while (true) {
    try {
      const rows = await prisma.subscriptionPlan.findMany({
        where: PLAN_LIST_WHERE,
        orderBy: [{ price: "asc" }, { createdAt: "asc" }],
      });
      return rows.map(rowToDoc);
    } catch (err: unknown) {
      attempt += 1;

      // Safely extract message/code
      let rawMsg = "";
      if (typeof err === "string") rawMsg = err;
      else if (err && typeof err === "object") {
        const e = err as Record<string, unknown>;
        if (typeof e.message === "string") rawMsg = e.message;
        else rawMsg = String(err);
      } else {
        rawMsg = String(err);
      }

      const msg = rawMsg.toLowerCase();
      const isTransient = /connection terminated|connection reset|econnreset|timeout/.test(msg);

      if (!isTransient || attempt >= maxAttempts) throw err;

      const backoffMs = 100 * Math.pow(2, attempt - 1);
      console.warn(
        `[subscription-plans retry] transient DB error, attempt ${attempt}/${maxAttempts}, retrying in ${backoffMs}ms: ${rawMsg}`
      );
      await new Promise((res) => setTimeout(res, backoffMs));
      // loop to retry
    }
  }
}

export async function getSubscriptionPlanBySlug(
  slug: string
): Promise<SubscriptionPlanDoc | null> {
  const row = await prisma.subscriptionPlan.findFirst({
    where: { slug, ...PLAN_LIST_WHERE },
  });
  return row ? rowToDoc(row) : null;
}

export async function getSubscriptionPlanById(
  id: string
): Promise<SubscriptionPlanDoc | null> {
  const row = await prisma.subscriptionPlan.findUnique({
    where: { id },
  });
  return row && !row.deletedAt ? rowToDoc(row) : null;
}

/** For admin: list all plans including inactive, excluding soft-deleted. */
export async function getAllSubscriptionPlansForAdmin(): Promise<
  SubscriptionPlanDoc[]
> {
  const rows = await prisma.subscriptionPlan.findMany({
    where: { deletedAt: null },
    orderBy: [{ price: "asc" }, { createdAt: "asc" }],
  });
  return rows.map(rowToDoc);
}

function rowToDoc(
  row: Awaited<ReturnType<typeof prisma.subscriptionPlan.findFirst>>
): SubscriptionPlanDoc {
  if (!row) throw new Error("No plan");
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    price: row.price,
    currency: row.currency,
    billingCycle: row.billingCycle,
    features: row.features ?? [],
    durationDays: row.durationDays,
    isPopular: row.isPopular,
    isRecommended: row.isRecommended,
    isActive: row.isActive,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const formatPrice = formatPriceFromUtil;
export const formatDurationDays = formatDurationDaysFromUtil;
