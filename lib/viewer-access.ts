import { prisma } from "@/lib/db";
import { getGraceCutoff } from "@/lib/subscription-grace";

/**
 * Returns true if the viewer (user) has an active subscription (including 48h grace).
 * Used for paywall: full escort content is only shown when this is true.
 */
export async function getViewerHasActiveSubscription(
  userId: string | null
): Promise<boolean> {
  if (!userId) return false;

  const now = new Date();
  const graceCutoff = getGraceCutoff(now);

  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
      OR: [{ endDate: { gte: graceCutoff } }, { endDate: null }],
    },
    orderBy: { createdAt: "desc" },
  });

  if (activeSubscription) return true;

  // Fallback: User.subscriptionStatus (kept in sync on approval/expiry).
  // Require endDate within grace so fallback matches Subscription logic.
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true, subscriptionEndDate: true },
  });

  if (user?.subscriptionStatus !== "active") return false;
  if (user.subscriptionEndDate == null) return true;
  return user.subscriptionEndDate.getTime() >= graceCutoff.getTime();
}
