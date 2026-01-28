import { PLAN_CATALOG, type PlanId } from "@/lib/plans";
import { prisma } from "@/lib/db";

export type PlanAccess = {
  planId: PlanId;
  priority: number;
  isPaid: boolean;
  canShowContact: boolean;
};

export async function expireStaleSubscriptions() {
  const now = new Date();
  await prisma.subscription.updateMany({
    where: {
      status: "active",
      endDate: { lt: now },
    },
    data: { status: "expired" },
  });
}

export async function getPlanPriorityMap() {
  const planDocs = await prisma.plan.findMany();
  const planMap = new Map(
    planDocs.map((plan) => [
      plan.name,
      { priority: plan.priority, price: plan.price },
    ])
  );
  const fallbackMap = new Map(
    PLAN_CATALOG.map((plan) => [
      plan.name,
      { priority: plan.priority, price: plan.priceEtb },
    ])
  );

  return { planMap, fallbackMap };
}

export async function getActiveSubscriptionsForUsers(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, { planId: PlanId }>();
  }

  const now = new Date();
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: { in: userIds },
      status: "active",
      OR: [
        { endDate: { gte: now } },
        { endDate: null },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const map = new Map<string, { planId: PlanId }>();
  for (const subscription of subscriptions) {
    if (!map.has(subscription.userId)) {
      map.set(subscription.userId, {
        planId: normalizePlanId(subscription.planId),
      });
    }
  }
  return map;
}

export async function getUserPlanAccess(userId: string): Promise<PlanAccess> {
  await expireStaleSubscriptions();

  const now = new Date();
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
      OR: [
        { endDate: { gte: now } },
        { endDate: null },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const planId = normalizePlanId(subscription?.planId ?? "Normal");
  const { planMap, fallbackMap } = await getPlanPriorityMap();
  return resolvePlanAccess(planId, planMap, fallbackMap);
}

function normalizePlanId(planId: string): PlanId {
  const allowed = PLAN_CATALOG.find((plan) => plan.id === planId);
  return allowed ? allowed.id : "Normal";
}

export function resolvePlanAccess(
  planId: PlanId,
  planMap: Map<string, { priority: number }>,
  fallbackMap: Map<string, { priority: number }>
): PlanAccess {
  const plan =
    planMap.get(planId) ?? fallbackMap.get(planId) ?? { priority: 1 };
  const isPaid = planId !== "Normal";
  return {
    planId,
    priority: plan.priority,
    isPaid,
    canShowContact: isPaid,
  };
}
