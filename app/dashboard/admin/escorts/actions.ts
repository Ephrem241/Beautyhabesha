"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

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
  user: {
    name?: string;
    email: string;
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
      user: {
        name: escort.user.name ?? undefined,
        email: escort.user.email,
      },
    };
  } catch {
    return null;
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