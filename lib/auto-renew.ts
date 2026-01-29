import "server-only";

import { prisma } from "@/lib/db";
import { getGraceCutoff } from "@/lib/subscription-grace";
import {
  sendAutoRenewInitiated,
  sendPaymentPendingApproval,
} from "@/lib/email";

const AUTO_RENEW_PLACEHOLDER_URL = "auto-renew";
const AUTO_RENEW_PLACEHOLDER_PUBLIC_ID = "auto-renew";

export type AutoRenewResult = {
  renewalsCreated: number;
  emailsSent: number;
  errors: string[];
};

/**
 * Daily cron: find subscriptions expiring in <= 1 day, user.autoRenew === true,
 * create new pending subscription (same plan, last payment method), notify escort.
 */
export async function processAutoRenewals(): Promise<AutoRenewResult> {
  const now = new Date();
  const inOneDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const graceCutoff = getGraceCutoff(now);

  const expiringSoon = await prisma.subscription.findMany({
    where: {
      status: "active",
      endDate: { gte: now, lte: inOneDay },
      user: {
        autoRenew: true,
      },
    },
    include: {
      user: {
        include: {
          escortProfile: true,
        },
      },
    },
    orderBy: { endDate: "asc" },
  });

  const errors: string[] = [];
  let renewalsCreated = 0;
  let emailsSent = 0;

  for (const sub of expiringSoon) {
    try {
      const existingPending = await prisma.subscription.findFirst({
        where: {
          userId: sub.userId,
          planId: sub.planId,
          status: "pending",
          paymentProofUrl: AUTO_RENEW_PLACEHOLDER_URL,
        },
      });
      if (existingPending) {
        continue;
      }

      await prisma.$transaction(async (tx) => {
        const created = await tx.subscription.create({
          data: {
            userId: sub.userId,
            planId: sub.planId,
            status: "pending",
            paymentMethod: sub.paymentMethod,
            paymentProofUrl: AUTO_RENEW_PLACEHOLDER_URL,
            paymentProofPublicId: AUTO_RENEW_PLACEHOLDER_PUBLIC_ID,
          },
        });

        await tx.user.update({
          where: { id: sub.userId },
          data: {
            renewalAttempts: { increment: 1 },
            lastRenewalAttempt: now,
          },
        });

        renewalsCreated += 1;

        const email = sub.user.email;
        const displayName = sub.user.escortProfile?.displayName ?? sub.user.name ?? "Member";
        await sendAutoRenewInitiated(email, displayName, sub.endDate!);
        await sendPaymentPendingApproval(email, displayName);
        emailsSent += 2;
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`User ${sub.userId}: ${msg}`);
    }
  }

  return { renewalsCreated, emailsSent, errors };
}

export function isAutoRenewSubscription(paymentProofUrl: string | null): boolean {
  return paymentProofUrl === AUTO_RENEW_PLACEHOLDER_URL;
}
