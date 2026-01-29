import { prisma } from "@/lib/db";
import { getGraceCutoff } from "@/lib/subscription-grace";

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export type ExpirationResult = {
  expiredCount: number;
  downgradedUsers: number;
  duplicatesExpired: number;
};

export async function expireSubscriptions(): Promise<ExpirationResult> {
  const now = new Date();
  const graceCutoff = getGraceCutoff(now);

  // 1) Expire active subscriptions past grace period (endDate + 48h < now).
  const expiredSubs = await prisma.subscription.findMany({
    where: {
      status: "active",
      endDate: { lt: graceCutoff },
    },
    include: {
      user: {
        include: {
          escortProfile: true,
        },
      },
    },
  });
  const expiredUserIds = Array.from(new Set(expiredSubs.map((s) => s.userId)));

  // Update subscriptions and users in transaction
  for (const sub of expiredSubs) {
    await prisma.$transaction(async (tx: TransactionClient) => {
      // Update subscription
      await tx.subscription.update({
        where: { id: sub.id },
        data: { status: "expired" },
      });

      await tx.user.update({
        where: { id: sub.userId },
        data: {
          subscriptionStatus: "expired",
          currentPlan: "Normal",
          subscriptionPlanId: null,
        },
      });

      // Hide escort profile if it exists
      if (sub.user.escortProfile) {
        await tx.escortProfile.update({
          where: { userId: sub.userId },
          data: {
            status: "suspended",
          },
        });
      }
    });
  }

  const updateResult = { count: expiredSubs.length };

  // 2) Ensure only one active subscription per user (keep newest).
  const activeSubs = await prisma.subscription.findMany({
    where: {
      status: "active",
      OR: [
        { endDate: { gte: graceCutoff } },
        { endDate: null },
      ],
    },
    orderBy: [
      { userId: "asc" },
      { startDate: "desc" },
      { createdAt: "desc" },
    ],
  });

  const seen = new Set<string>();
  const duplicateIds: string[] = [];
  for (const sub of activeSubs) {
    if (seen.has(sub.userId)) {
      duplicateIds.push(sub.id);
    } else {
      seen.add(sub.userId);
    }
  }

  let duplicatesExpired = 0;
  if (duplicateIds.length > 0) {
    const dupResult = await prisma.subscription.updateMany({
      where: { id: { in: duplicateIds } },
      data: { status: "expired" },
    });
    duplicatesExpired = dupResult.count;
  }

  // 3) Downgrade users to Normal if they no longer have any active subscription.
  const affectedUserIds = Array.from(
    new Set([...expiredUserIds, ...seen.values()])
  );
  const stillActiveSubs = await prisma.subscription.findMany({
    where: {
      userId: { in: affectedUserIds },
      status: "active",
      OR: [
        { endDate: { gte: graceCutoff } },
        { endDate: null },
      ],
    },
    select: { userId: true },
  });
  const stillActiveUserIds = Array.from(new Set(stillActiveSubs.map((s) => s.userId)));

  const stillActiveSet = new Set(stillActiveUserIds);
  const toDowngrade = affectedUserIds.filter(
    (userId) => !stillActiveSet.has(userId)
  );

  let downgradedUsers = 0;
  if (toDowngrade.length > 0) {
    const downgradeResult = await prisma.user.updateMany({
      where: { id: { in: toDowngrade } },
      data: {
        currentPlan: "Normal",
        subscriptionStatus: "expired",
      },
    });
    downgradedUsers = downgradeResult.count;
  }

  return {
    expiredCount: updateResult.count,
    downgradedUsers,
    duplicatesExpired,
  };
}
