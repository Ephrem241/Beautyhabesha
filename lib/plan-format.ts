/** Pure formatters and types for use in client components. No Prisma/server imports. */

export type PlanDisplay = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  billingCycle: string;
  durationDays: number;
  features: string[];
  isPopular: boolean;
  isRecommended: boolean;
  isActive: boolean;
};

export function formatPrice(plan: {
  price: number;
  currency: string;
  billingCycle: string;
}): string {
  if (plan.price === 0) return "Free";
  const amt = plan.price.toLocaleString("en-ET");
  const cycle =
    plan.billingCycle === "yearly" ? "/ year" : plan.billingCycle === "monthly" ? "/ month" : "";
  return `${plan.currency} ${amt}${cycle}`;
}

export function formatDurationDays(days: number): string {
  if (days <= 0) return "No expiry";
  if (days === 365) return "1 year";
  if (days > 365) return `${Math.round(days / 365)} years`;
  return `${days} days`;
}
