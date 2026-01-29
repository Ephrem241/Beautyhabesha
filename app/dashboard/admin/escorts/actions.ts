"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import type { PlanId } from "@/lib/plans";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractImageUrls } from "@/lib/image-helpers";

export type EscortActionResult = {
  ok: boolean;
  error?: string;
};

export type EscortDetails = {
  id: string;
  displayName: string;
  bio?: string;
  city?: string;
  images: string[];
  phone?: string;
  telegram?: string;
  whatsapp?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  approvedAt?: Date;
  approvedBy?: string;
  createdAt: Date;
  lastActiveAt?: Date | null;
  rankingBoostUntil?: Date | null;
  rankingSuspended: boolean;
  manualPlanId: string | null;
  user: {
    name?: string;
    email?: string | null;
    username?: string | null;
  };
};

const escortActionSchema = z.object({
  escortId: z.string().min(1),
});

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
  return session.user.id;
}

export async function getEscortDetails(escortId: string): Promise<EscortDetails | null> {
  await requireAdmin();

  try {
    const escort = await prisma.escortProfile.findUnique({
      where: { id: escortId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            username: true,
          },
        },
      },
    });

    if (!escort) return null;

    return {
      id: escort.id,
      displayName: escort.displayName,
      bio: escort.bio ?? undefined,
      city: escort.city ?? undefined,
      images: extractImageUrls(escort.images),
      phone: escort.phone ?? undefined,
      telegram: escort.telegram ?? undefined,
      whatsapp: escort.whatsapp ?? undefined,
      status: escort.status,
      approvedAt: escort.approvedAt ?? undefined,
      approvedBy: escort.approvedBy ?? undefined,
      createdAt: escort.createdAt,
      lastActiveAt: escort.lastActiveAt ?? undefined,
      rankingBoostUntil: escort.rankingBoostUntil ?? undefined,
      rankingSuspended: escort.rankingSuspended,
      manualPlanId: escort.manualPlanId,
      user: {
        name: escort.user.name ?? undefined,
        email: escort.user.email ?? undefined,
        username: escort.user.username ?? undefined,
      },
    };
  } catch {
    return null;
  }
}

const rankingActionSchema = z.object({
  escortId: z.string().min(1),
});

const boostSchema = rankingActionSchema.extend({
  until: z.string().datetime(),
});

export async function boostEscortRanking(
  _prevState: EscortActionResult,
  formData: FormData
): Promise<EscortActionResult> {
  await requireAdmin();

  const parsed = boostSchema.safeParse({
    escortId: formData.get("escortId"),
    until: formData.get("until"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request. Provide escortId and until (ISO date)." };
  }

  try {
    await prisma.escortProfile.update({
      where: { id: parsed.data.escortId },
      data: { rankingBoostUntil: new Date(parsed.data.until) },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to set boost." };
  }
}

const suspendRankingSchema = rankingActionSchema.extend({
  suspended: z.enum(["true", "false"]),
});

export async function setRankingSuspended(
  _prevState: EscortActionResult,
  formData: FormData
): Promise<EscortActionResult> {
  await requireAdmin();

  const parsed = suspendRankingSchema.safeParse({
    escortId: formData.get("escortId"),
    suspended: formData.get("suspended"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  try {
    await prisma.escortProfile.update({
      where: { id: parsed.data.escortId },
      data: { rankingSuspended: parsed.data.suspended === "true" },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update ranking suspension." };
  }
}

const manualPlanSchema = rankingActionSchema.extend({
  planId: z.enum(["Normal", "VIP", "Platinum"]),
});

export async function setManualPlan(
  _prevState: EscortActionResult,
  formData: FormData
): Promise<EscortActionResult> {
  await requireAdmin();

  const parsed = manualPlanSchema.safeParse({
    escortId: formData.get("escortId"),
    planId: formData.get("planId"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request. Choose Normal, VIP, or Platinum." };
  }

  try {
    await prisma.escortProfile.update({
      where: { id: parsed.data.escortId },
      data: { manualPlanId: parsed.data.planId as PlanId },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to set manual tier." };
  }
}

export async function clearManualPlan(
  _prevState: EscortActionResult,
  formData: FormData
): Promise<EscortActionResult> {
  await requireAdmin();

  const parsed = rankingActionSchema.safeParse({
    escortId: formData.get("escortId"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  try {
    await prisma.escortProfile.update({
      where: { id: parsed.data.escortId },
      data: { manualPlanId: null },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to clear manual tier." };
  }
}

export async function clearBoost(
  _prevState: EscortActionResult,
  formData: FormData
): Promise<EscortActionResult> {
  await requireAdmin();

  const parsed = rankingActionSchema.safeParse({
    escortId: formData.get("escortId"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  try {
    await prisma.escortProfile.update({
      where: { id: parsed.data.escortId },
      data: { rankingBoostUntil: null },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to clear boost." };
  }
}

export async function approveEscort(
  _prevState: EscortActionResult,
  formData: FormData
): Promise<EscortActionResult> {
  const adminId = await requireAdmin();

  const parsed = escortActionSchema.safeParse({
    escortId: formData.get("escortId"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  try {
    await prisma.escortProfile.update({
      where: { id: parsed.data.escortId },
      data: {
        status: "approved",
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to approve escort." };
  }
}

export async function rejectEscort(
  _prevState: EscortActionResult,
  formData: FormData
): Promise<EscortActionResult> {
  await requireAdmin();

  const parsed = escortActionSchema.safeParse({
    escortId: formData.get("escortId"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  try {
    await prisma.escortProfile.update({
      where: { id: parsed.data.escortId },
      data: {
        status: "rejected",
        approvedAt: null,
        approvedBy: null,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to reject escort." };
  }
}

export async function suspendEscort(
  _prevState: EscortActionResult,
  formData: FormData
): Promise<EscortActionResult> {
  await requireAdmin();

  const parsed = escortActionSchema.safeParse({
    escortId: formData.get("escortId"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  try {
    await prisma.escortProfile.update({
      where: { id: parsed.data.escortId },
      data: {
        status: "suspended",
        approvedAt: null,
        approvedBy: null,
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to suspend escort." };
  }
}