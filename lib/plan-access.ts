import { type PlanId, PLAN_CATALOG } from "@/lib/plans";
import { getUserPlanAccess } from "@/lib/subscription-access";

export type PlanFeature =
  | "contact"
  | "featured"
  | "homepage_spotlight"
  | "priority_listing";

export type PlanAccessDetails = {
  planId: PlanId;
  priority: number;
  imageLimit: number | null;
  canShowContact: boolean;
  hasFeaturedBadge: boolean;
  hasHomepageSpotlight: boolean;
};

export function buildPlanAccess(planId: PlanId, priority: number) {
  const imageLimit =
    planId === "Platinum" ? null : planId === "VIP" ? 10 : 3;
  const isPaid = planId !== "Normal";
  return {
    planId,
    priority,
    imageLimit,
    canShowContact: isPaid,
    hasFeaturedBadge: planId === "Platinum",
    hasHomepageSpotlight: planId === "Platinum",
  };
}

export function hasFeatureAccess(
  access: PlanAccessDetails,
  feature: PlanFeature
) {
  if (feature === "contact") return access.canShowContact;
  if (feature === "featured") return access.hasFeaturedBadge;
  if (feature === "homepage_spotlight") return access.hasHomepageSpotlight;
  if (feature === "priority_listing") return access.priority > 1;
  return false;
}

export async function getUserPlan(userId: string): Promise<PlanAccessDetails> {
  const access = await getUserPlanAccess(userId);
  return buildPlanAccess(access.planId, access.priority);
}

export function getPlanPriority(planId: PlanId) {
  const plan = PLAN_CATALOG.find((item) => item.id === planId);
  return plan?.priority ?? 1;
}
