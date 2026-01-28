"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPlanById } from "@/lib/plans";

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export type PaymentActionResult = {
  ok: boolean;
  error?: string;
};

const approveSchema = z.object({
  subscriptionId: z.string().min(1),
});

const rejectSchema = z.object({
  subscriptionId: z.string().min(1),
  reason: z.string().max(200).optional().or(z.literal("")),
});

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export async function approvePayment(
  _prevState: PaymentActionResult,
  formData: FormData
): Promise<PaymentActionResult> {
  await requireAdmin();

  const parsed = approveSchema.safeParse({
    subscriptionId: formData.get("subscriptionId"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  // Use Prisma transaction for atomic updates
    await prisma.$transaction(async (tx: TransactionClient) => {
    const subscription = await tx.subscription.findUnique({
      where: { id: parsed.data.subscriptionId },
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

    // Ensure only one active subscription per user.
    await tx.subscription.updateMany({
      where: {
        userId: subscription.userId,
        status: "active",
        id: { not: subscription.id },
      },
      data: { status: "expired" },
    });

    // Update subscription
    const updated = await tx.subscription.update({
      where: { id: subscription.id },
      data: {
        status: "active",
        startDate,
        endDate,
        approvedAt: new Date(),
        rejectionReason: null,
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

  return { ok: true };
}

export async function rejectPayment(
  _prevState: PaymentActionResult,
  formData: FormData
): Promise<PaymentActionResult> {
  await requireAdmin();

  const parsed = rejectSchema.safeParse({
    subscriptionId: formData.get("subscriptionId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

    await prisma.$transaction(async (tx: TransactionClient) => {
    const subscription = await tx.subscription.findUnique({
      where: { id: parsed.data.subscriptionId },
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
      where: { id: parsed.data.subscriptionId },
      data: {
        status: "rejected",
        rejectionReason: parsed.data.reason?.trim() || null,
      },
    });

    return {
      subscription: updated,
      user: subscription.user,
    };
  });

  return { ok: true };
}
