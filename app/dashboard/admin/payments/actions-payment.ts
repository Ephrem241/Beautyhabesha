"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type PaymentActionResult = {
  ok: boolean;
  error?: string;
};

const approveSchema = z.object({
  paymentId: z.string().min(1),
});

const rejectSchema = z.object({
  paymentId: z.string().min(1),
  reason: z.string().max(200).optional().or(z.literal("")),
});

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export async function approvePaymentRecord(
  _prevState: PaymentActionResult,
  formData: FormData
): Promise<PaymentActionResult> {
  await requireAdmin();

  const parsed = approveSchema.safeParse({
    paymentId: formData.get("paymentId"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const payment = await prisma.payment.findUnique({
    where: { id: parsed.data.paymentId },
    include: {
      user: { include: { escortProfile: true } },
      plan: true,
    },
  });

  if (!payment || payment.status !== "pending") {
    return { ok: false, error: "Payment not found or already processed." };
  }

  const startDate = new Date();
  const durationDays = payment.plan.durationDays ?? 30;
  const endDate =
    durationDays > 0
      ? new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000)
      : new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: "approved", approvedAt: new Date() },
    });

    await tx.user.update({
      where: { id: payment.userId },
      data: {
        subscriptionStatus: "active",
        subscriptionPlanId: payment.planId,
        subscriptionStartDate: startDate,
        subscriptionEndDate: endDate,
        currentPlan: payment.plan.name,
      },
    });

    if (payment.user.escortProfile) {
      await tx.escortProfile.update({
        where: { userId: payment.userId },
        data: { status: "approved" },
      });
    }
  });

  return { ok: true };
}

export async function rejectPaymentRecord(
  _prevState: PaymentActionResult,
  formData: FormData
): Promise<PaymentActionResult> {
  await requireAdmin();

  const parsed = rejectSchema.safeParse({
    paymentId: formData.get("paymentId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const payment = await prisma.payment.findUnique({
    where: { id: parsed.data.paymentId },
  });

  if (!payment || payment.status !== "pending") {
    return { ok: false, error: "Payment not found or already processed." };
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: "rejected",
      rejectionReason: parsed.data.reason?.trim() || null,
    },
  });

  return { ok: true };
}
