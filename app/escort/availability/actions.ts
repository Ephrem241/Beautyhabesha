"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type AvailabilityActionResult = { ok: boolean; error?: string };

const slotSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  mode: z.enum(["online", "in_person"]),
});

async function getEscortIdOrAdmin(): Promise<{ escortId: string; isAdmin: boolean } | null> {
  const session = await getAuthSession();
  if (!session?.user?.id) return null;

  if (session.user.role === "admin") {
    return { escortId: "", isAdmin: true };
  }

  const profile = await prisma.escortProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile) return null;
  return { escortId: profile.id, isAdmin: false };
}

async function requireEscortOwnership(escortId: string): Promise<string> {
  const session = await getAuthSession();
  if (!session?.user?.id) throw new Error("Not authenticated");

  if (session.user.role === "admin") return escortId;

  const profile = await prisma.escortProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!profile || profile.id !== escortId) {
    redirect("/");
  }
  return escortId;
}

export async function createAvailability(
  _prevState: AvailabilityActionResult,
  formData: FormData
): Promise<AvailabilityActionResult> {
  const auth = await getEscortIdOrAdmin();
  if (!auth) return { ok: false, error: "Not authenticated." };

  const escortId = auth.isAdmin
    ? String(formData.get("escortId") ?? "").trim()
    : auth.escortId;
  if (!escortId) return { ok: false, error: "Escort required." };

  try {
    await requireEscortOwnership(escortId);
  } catch {
    return { ok: false, error: "Not allowed to edit this calendar." };
  }

  const parsed = slotSchema.safeParse({
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    mode: formData.get("mode"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid slot (date, start, end, mode)." };
  }

  const date = new Date(parsed.data.date);
  if (date < new Date(new Date().toDateString())) {
    return { ok: false, error: "Date must be today or in the future." };
  }

  const escort = await prisma.escortProfile.findUnique({
    where: { id: escortId },
  });
  if (!escort) return { ok: false, error: "Escort not found." };

  await prisma.availability.create({
    data: {
      escortId,
      date,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      mode: parsed.data.mode as "online" | "in_person",
      isBooked: false,
    },
  });
  await prisma.escortProfile.update({
    where: { id: escortId },
    data: { lastActiveAt: new Date() },
  });
  return { ok: true };
}

const idSchema = z.object({ id: z.string().min(1) });

export async function updateAvailability(
  _prevState: AvailabilityActionResult,
  formData: FormData
): Promise<AvailabilityActionResult> {
  const auth = await getEscortIdOrAdmin();
  if (!auth) return { ok: false, error: "Not authenticated." };

  const idParsed = idSchema.safeParse({ id: formData.get("id") });
  if (!idParsed.success) return { ok: false, error: "Invalid slot id." };

  const existing = await prisma.availability.findUnique({
    where: { id: idParsed.data.id },
  });
  if (!existing) return { ok: false, error: "Slot not found." };

  try {
    await requireEscortOwnership(existing.escortId);
  } catch {
    return { ok: false, error: "Not allowed to edit this calendar." };
  }

  const parsed = slotSchema.safeParse({
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    mode: formData.get("mode"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid slot data." };
  }

  const date = new Date(parsed.data.date);

  await prisma.availability.update({
    where: { id: idParsed.data.id },
    data: {
      date,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      mode: parsed.data.mode as "online" | "in_person",
    },
  });
  await prisma.escortProfile.update({
    where: { id: existing.escortId },
    data: { lastActiveAt: new Date() },
  });
  return { ok: true };
}

export async function deleteAvailability(
  _prevState: AvailabilityActionResult,
  formData: FormData
): Promise<AvailabilityActionResult> {
  const auth = await getEscortIdOrAdmin();
  if (!auth) return { ok: false, error: "Not authenticated." };

  const parsed = idSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return { ok: false, error: "Invalid slot id." };

  const existing = await prisma.availability.findUnique({
    where: { id: parsed.data.id },
  });
  if (!existing) return { ok: false, error: "Slot not found." };

  try {
    await requireEscortOwnership(existing.escortId);
  } catch {
    return { ok: false, error: "Not allowed to edit this calendar." };
  }

  await prisma.availability.delete({
    where: { id: parsed.data.id },
  });
  await prisma.escortProfile.update({
    where: { id: existing.escortId },
    data: { lastActiveAt: new Date() },
  });
  return { ok: true };
}

export async function setAvailabilityBooked(
  slotId: string,
  isBooked: boolean
): Promise<AvailabilityActionResult> {
  const auth = await getEscortIdOrAdmin();
  if (!auth) return { ok: false, error: "Not authenticated." };

  const existing = await prisma.availability.findUnique({
    where: { id: slotId },
  });
  if (!existing) return { ok: false, error: "Slot not found." };

  try {
    await requireEscortOwnership(existing.escortId);
  } catch {
    return { ok: false, error: "Not allowed." };
  }

  await prisma.availability.update({
    where: { id: slotId },
    data: { isBooked },
  });
  return { ok: true };
}
