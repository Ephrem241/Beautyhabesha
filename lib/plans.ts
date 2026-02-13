import { prisma } from "@/lib/db";

export type PlanId = "Normal" | "VIP" | "Platinum";

export type PlanDetails = {
  id: PlanId;
  name: string;
  priceLabel: string;
  priceEtb: number;
  durationLabel: string;
  durationDays: number;
  features: string[];
  description: string;
  popular: boolean;
  priority: number;
};

export const PLAN_CATALOG: PlanDetails[] = [
  {
    id: "Normal",
    name: "Normal",
    priceLabel: "Free",
    priceEtb: 0,
    durationLabel: "No expiry",
    durationDays: 0,
    priority: 1,
    description: "Start for free with a visible profile.",
    features: [
      "Public profile listing",
      "Up to 3 photos",
      "Standard listing position",
      "Basic support",
    ],
    popular: false,
  },
  {
    id: "VIP",
    name: "VIP",
    priceLabel: "ETB 1,500",
    priceEtb: 1500,
    durationLabel: "30 days",
    durationDays: 30,
    priority: 2,
    description: "Boost visibility with priority placement.",
    features: [
      "Priority listing position",
      "Up to 10 photos",
      "Verification badge",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "Platinum",
    name: "Platinum",
    priceLabel: "ETB 3,500",
    priceEtb: 3500,
    durationLabel: "30 days",
    durationDays: 30,
    priority: 3,
    description: "Maximum exposure with premium placement.",
    features: [
      "Top listing position",
      "Unlimited photos",
      "Home page feature",
      "Dedicated support",
    ],
    popular: true,
  },
];

export function getPlanById(planId?: string | null) {
  if (!planId) return null;
  return PLAN_CATALOG.find((plan) => plan.id === planId) ?? null;
}

export async function getEffectivePlanCatalog(): Promise<PlanDetails[]> {
  const dbPlans = await prisma.subscriptionPlan.findMany({
    where: { deletedAt: null },
  });
  const map = new Map(dbPlans.map((plan) => [plan.name, plan]));

  return PLAN_CATALOG.map((base) => {
    const override = map.get(base.id);
    if (!override) return base;

    const priceEtb = override.price;
    const durationDays = override.durationDays;

    const priceLabel =
      priceEtb === 0 ? "Free" : `ETB ${priceEtb.toLocaleString("en-ET")}`;
    const durationLabel =
      durationDays === 0 ? base.durationLabel : `${durationDays} days`;

    return {
      ...base,
      priceEtb,
      durationDays,
      priceLabel,
      durationLabel,
    };
  });
}

export async function getEffectivePlanById(
  planId: PlanId
): Promise<PlanDetails> {
  const catalog = await getEffectivePlanCatalog();
  return catalog.find((plan) => plan.id === planId)!;
}

