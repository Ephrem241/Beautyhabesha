import { prisma } from "@/lib/db";

export const FEATURE_KEYS = [
  "view_models",
  "private_gallery",
  "direct_message",
  "live_video_call",
  "unlimited_downloads",
] as const;

export type FeatureKey = (typeof FEATURE_KEYS)[number];

/**
 * Check if the user has access to a feature via their active subscription plan.
 * Resolves plan from User.subscriptionPlanId or active Subscription -> SubscriptionPlan.
 * Server-side only.
 */
export async function hasFeature(
  userId: string,
  featureKey: string
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionPlanId: true,
      subscriptionStatus: true,
      subscriptionEndDate: true,
    },
  });
  if (!user) return false;

  // Use subscriptionPlanId when set and subscription still active
  if (user.subscriptionPlanId && user.subscriptionStatus === "active") {
    const end = user.subscriptionEndDate;
    if (end && end < new Date()) return false;
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: user.subscriptionPlanId },
      select: { features: true },
    });
    if (plan?.features && Array.isArray(plan.features)) {
      return plan.features.includes(featureKey);
    }
  }

  // Fallback: latest active subscription with subscriptionPlanId
  const graceCutoff = await import("@/lib/subscription-grace").then((m) =>
    m.getGraceCutoff(new Date())
  );
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
      subscriptionPlanId: { not: null },
      OR: [{ endDate: { gte: graceCutoff } }, { endDate: null }],
    },
    orderBy: { createdAt: "desc" },
    include: { subscriptionPlan: { select: { features: true } } },
  });
  if (sub?.subscriptionPlan?.features && Array.isArray(sub.subscriptionPlan.features)) {
    return sub.subscriptionPlan.features.includes(featureKey);
  }

  return false;
}

/**
 * Get all feature keys the user has access to.
 */
export async function getUserFeatures(userId: string): Promise<string[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionPlanId: true, subscriptionStatus: true, subscriptionEndDate: true },
  });
  if (!user) return [];

  if (user.subscriptionPlanId && user.subscriptionStatus === "active") {
    const end = user.subscriptionEndDate;
    if (end && end < new Date()) return [];
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: user.subscriptionPlanId },
      select: { features: true },
    });
    return (plan?.features as string[]) ?? [];
  }

  const graceCutoff = await import("@/lib/subscription-grace").then((m) =>
    m.getGraceCutoff(new Date())
  );
  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
      subscriptionPlanId: { not: null },
      OR: [{ endDate: { gte: graceCutoff } }, { endDate: null }],
    },
    orderBy: { createdAt: "desc" },
    include: { subscriptionPlan: { select: { features: true } } },
  });
  return (sub?.subscriptionPlan?.features as string[]) ?? [];
}
