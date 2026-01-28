"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlanById } from "@/lib/plans";

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

const formSchema = z.object({
  subscriptionId: z.string().min(1),
});

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export async function approveSubscription(formData: FormData) {
  await requireAdmin();

  const result = formSchema.safeParse({
    subscriptionId: formData.get("subscriptionId"),
  });

  if (!result.success) {
    redirect("/admin/subscriptions?error=invalid-request");
  }

  try {
    await prisma.$transaction(async (tx: TransactionClient) => {
      const subscription = await tx.subscription.findUnique({
        where: { id: result.data.subscriptionId },
        include: {
          user: {
            include: {
              escortProfile: true,
            },
          },
        },
      });

      if (!subscription) {
        throw new Error("Subscription not found.");
      }

      if (subscription.status !== "pending") {
        throw new Error("Subscription already processed.");
      }

      const planDoc = await tx.plan.findUnique({
        where: { name: subscription.planId },
      });
      const fallbackPlan = getPlanById(subscription.planId);
      const durationDays = planDoc?.durationDays ?? fallbackPlan?.durationDays ?? 30;

      const startDate = new Date();
      const endDate =
        durationDays > 0
          ? new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000)
          : null;

      // Ensure only one active subscription per user
      await tx.subscription.updateMany({
        where: {
          userId: subscription.userId,
          status: "active",
          id: { not: subscription.id },
        },
        data: { status: "expired" },
      });

      const updated = await tx.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "active",
          startDate,
          endDate,
          approvedAt: new Date(),
        },
      });

      // Update user subscription fields
      await tx.user.update({
        where: { id: subscription.userId },
        data: {
          subscriptionStartDate: startDate,
          subscriptionEndDate: endDate,
          subscriptionStatus: "active",
          currentPlan: subscription.planId,
        },
      });

      // Make escort profile visible if it exists
      if (subscription.user.escortProfile) {
        await tx.escortProfile.update({
          where: { userId: subscription.userId },
          data: {
            status: "approved",
          },
        });
      }

      return {
        subscription: updated,
        user: subscription.user,
        planName: planDoc?.name ?? subscription.planId,
        endDate: endDate!,
      };
    });

    redirect("/admin/subscriptions?status=approved");
  } catch (error) {
    console.error("Error approving subscription:", error);
    redirect("/admin/subscriptions?error=processing-failed");
  }
}

export async function rejectSubscription(formData: FormData) {
  await requireAdmin();

  const result = formSchema.safeParse({
    subscriptionId: formData.get("subscriptionId"),
  });

  if (!result.success) {
    redirect("/admin/subscriptions?error=invalid-request");
  }

  try {
    await prisma.$transaction(async (tx: TransactionClient) => {
      const subscription = await tx.subscription.findUnique({
        where: { id: result.data.subscriptionId },
        include: {
          user: true,
        },
      });

      if (!subscription) {
        throw new Error("Subscription not found.");
      }

      if (subscription.status !== "pending") {
        throw new Error("Subscription already processed.");
      }

      const updated = await tx.subscription.update({
        where: { id: result.data.subscriptionId },
        data: { status: "rejected" },
      });

      return {
        subscription: updated,
        user: subscription.user,
      };
    });

    redirect("/admin/subscriptions?status=rejected");
  } catch (error) {
    console.error("Error rejecting subscription:", error);
    redirect("/admin/subscriptions?error=processing-failed");
  }
}
