"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type UserActionResult = {
  ok: boolean;
  error?: string;
};

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "escort", "user"]),
});

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
  return session;
}

export async function updateUserRole(
  _prevState: UserActionResult,
  formData: FormData
): Promise<UserActionResult> {
  const session = await requireAdmin();

  const parsed = updateRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  // Prevent an admin from removing their own admin role
  if (session.user && session.user.id === parsed.data.userId && parsed.data.role !== "admin") {
    return { ok: false, error: "You cannot remove your own admin role." };
  }

  const targetUser = await prisma.user.findUnique({ where: { id: parsed.data.userId } });
  if (!targetUser) {
    return { ok: false, error: "User not found." };
  }

  // If we're demoting an admin, ensure there will still be at least one admin left
  if (targetUser.role === "admin" && parsed.data.role !== "admin") {
    const adminCount = await prisma.user.count({ where: { role: "admin" } });
    if (adminCount <= 1) {
      return { ok: false, error: "Cannot remove the last admin." };
    }
  }

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role },
  });

  return { ok: true };
}

const userIdSchema = z.object({ userId: z.string().min(1) });

export async function setUserAutoRenew(
  _prevState: UserActionResult,
  formData: FormData
): Promise<UserActionResult> {
  await requireAdmin();

  const parsed = userIdSchema.extend({
    enabled: z.enum(["true", "false"]),
  }).safeParse({
    userId: formData.get("userId"),
    enabled: formData.get("enabled"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  try {
    await prisma.user.update({
      where: { id: parsed.data.userId },
      data: { autoRenew: parsed.data.enabled === "true" },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update auto-renew." };
  }
}

const EXTEND_DAYS = 30;

export async function forceRenewSubscription(
  _prevState: UserActionResult,
  formData: FormData
): Promise<UserActionResult> {
  await requireAdmin();

  const parsed = userIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const { getGraceCutoff } = await import("@/lib/subscription-grace");
  const now = new Date();
  const graceCutoff = getGraceCutoff(now);

  const activeSub = await prisma.subscription.findFirst({
    where: {
      userId: parsed.data.userId,
      status: "active",
      OR: [{ endDate: { gte: graceCutoff } }, { endDate: null }],
    },
    orderBy: { endDate: "desc" },
  });

  if (!activeSub) {
    return { ok: false, error: "No active subscription to extend." };
  }

  const currentEnd = activeSub.endDate ?? now;
  const newEnd = new Date(
    currentEnd.getTime() + EXTEND_DAYS * 24 * 60 * 60 * 1000
  );

  try {
    await prisma.$transaction([
      prisma.subscription.update({
        where: { id: activeSub.id },
        data: { endDate: newEnd },
      }),
      prisma.user.update({
        where: { id: parsed.data.userId },
        data: { subscriptionEndDate: newEnd },
      }),
    ]);
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to extend subscription." };
  }
}

export async function banUser(
  _prevState: UserActionResult,
  formData: FormData
): Promise<UserActionResult> {
  await requireAdmin();

  const parsed = userIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  try {
    await prisma.user.update({
      where: { id: parsed.data.userId },
      data: { bannedAt: new Date() },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to ban user." };
  }
}

export async function unbanUser(
  _prevState: UserActionResult,
  formData: FormData
): Promise<UserActionResult> {
  await requireAdmin();

  const parsed = userIdSchema.safeParse({
    userId: formData.get("userId"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  try {
    await prisma.user.update({
      where: { id: parsed.data.userId },
      data: { bannedAt: null },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to unban user." };
  }
}
