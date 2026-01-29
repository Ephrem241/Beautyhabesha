"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendBookingApproved, sendBookingRejected, sendEscortNewBooking } from "@/lib/email";

export type AdminBookingActionResult = { ok: boolean; error?: string };

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

const depositIdSchema = z.object({ depositId: z.string().min(1) });
const rejectSchema = depositIdSchema.extend({
  reason: z.string().max(500).optional().or(z.literal("")),
});

export async function approveDeposit(
  _prevState: AdminBookingActionResult,
  formData: FormData
): Promise<AdminBookingActionResult> {
  await requireAdmin();

  const parsed = depositIdSchema.safeParse({
    depositId: formData.get("depositId"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const deposit = await prisma.depositPayment.findUnique({
    where: { id: parsed.data.depositId, status: "pending" },
    include: {
      booking: {
        include: {
          user: { select: { email: true, username: true, name: true } },
          escortProfile: {
            include: { user: { select: { email: true, username: true } } },
          },
        },
      },
    },
  });

  if (!deposit) {
    return { ok: false, error: "Deposit not found or already processed." };
  }

  await prisma.$transaction([
    prisma.depositPayment.update({
      where: { id: parsed.data.depositId },
      data: { status: "approved" },
    }),
    prisma.booking.update({
      where: { id: deposit.bookingId },
      data: { status: "approved" },
    }),
  ]);

  const booking = deposit.booking;
  const dateStr = new Date(booking.date).toLocaleDateString();
  const slot = `${booking.startTime}–${booking.endTime}`;

  const userIdent = booking.user.email ?? booking.user.username ?? "";
  const escortIdent = booking.escortProfile.user.email ?? booking.escortProfile.user.username ?? "";
  await sendBookingApproved(
    userIdent,
    booking.user.name ?? "User",
    booking.escortProfile.displayName,
    dateStr,
    slot
  );
  await sendEscortNewBooking(
    escortIdent,
    booking.escortProfile.displayName,
    dateStr,
    slot
  );

  return { ok: true };
}

export async function rejectDeposit(
  _prevState: AdminBookingActionResult,
  formData: FormData
): Promise<AdminBookingActionResult> {
  await requireAdmin();

  const parsed = rejectSchema.safeParse({
    depositId: formData.get("depositId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const deposit = await prisma.depositPayment.findUnique({
    where: { id: parsed.data.depositId, status: "pending" },
    include: {
      booking: {
        include: {
          user: { select: { email: true, username: true, name: true } },
        },
      },
    },
  });

  if (!deposit) {
    return { ok: false, error: "Deposit not found or already processed." };
  }

  await prisma.$transaction([
    prisma.depositPayment.update({
      where: { id: parsed.data.depositId },
      data: {
        status: "rejected",
        rejectionReason: parsed.data.reason?.trim() || null,
      },
    }),
    prisma.booking.update({
      where: { id: deposit.bookingId },
      data: { status: "rejected" },
    }),
  ]);

  const userIdent = deposit.booking.user.email ?? deposit.booking.user.username ?? "";
  await sendBookingRejected(
    userIdent,
    deposit.booking.user.name ?? "User",
    parsed.data.reason?.trim()
  );

  return { ok: true };
}
