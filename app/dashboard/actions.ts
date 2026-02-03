"use server";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getGraceCutoff } from "@/lib/subscription-grace";

export type RenewalDashboardData = {
  autoRenew: boolean;
  nextRenewalDate: Date | null;
  renewalHistory: Array<{
    id: string;
    planId: string;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    createdAt: Date;
  }>;
};

export type SetAutoRenewResult = { ok: boolean; error?: string };

export async function getRenewalDashboardData(
  userId: string
): Promise<RenewalDashboardData | null> {
  const session = await getAuthSession();
  if (!session?.user || session.user.id !== userId) return null;

  const now = new Date();
  const graceCutoff = getGraceCutoff(now);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { autoRenew: true },
  });
  if (!user) return null;

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
      OR: [{ endDate: { gte: graceCutoff } }, { endDate: null }],
    },
    orderBy: { endDate: "desc" },
  });

  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    select: {
      id: true,
      planId: true,
      status: true,
      startDate: true,
      endDate: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return {
    autoRenew: user.autoRenew,
    nextRenewalDate: activeSubscription?.endDate ?? null,
    renewalHistory: subscriptions.map((s) => ({
      id: s.id,
      planId: s.planId,
      status: s.status,
      startDate: s.startDate,
      endDate: s.endDate,
      createdAt: s.createdAt,
    })),
  };
}

export async function setAutoRenew(
  enabled: boolean
): Promise<SetAutoRenewResult> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { ok: false, error: "Not authenticated." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { autoRenew: enabled },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update auto-renew." };
  }
}
