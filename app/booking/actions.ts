"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary-utils";
import {
  sendBookingRequested,
  sendDepositSubmitted,
  sendEscortNewBooking,
  sendBookingCompleted,
} from "@/lib/email";

export type BookingActionResult = { ok: boolean; error?: string; bookingId?: string };

const createBookingSchema = z.object({
  escortId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  mode: z.enum(["online", "in_person"]),
  depositAmount: z.number().positive(),
});

export async function createBooking(
  _prevState: BookingActionResult,
  formData: FormData
): Promise<BookingActionResult> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in to book." };
  }

  const parsed = createBookingSchema.safeParse({
    escortId: formData.get("escortId"),
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    mode: formData.get("mode"),
    depositAmount: Number(formData.get("depositAmount")),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid booking details." };
  }

  const escort = await prisma.escortProfile.findUnique({
    where: { id: parsed.data.escortId, status: "approved" },
    include: { user: { select: { email: true, username: true } } },
  });
  if (!escort) {
    return { ok: false, error: "Escort not found or not available." };
  }

  const date = new Date(parsed.data.date);
  if (date < new Date(new Date().toDateString())) {
    return { ok: false, error: "Date must be today or in the future." };
  }

  const booking = await prisma.booking.create({
    data: {
      userId: session.user.id,
      escortId: parsed.data.escortId,
      date,
      startTime: parsed.data.startTime,
      endTime: parsed.data.endTime,
      mode: parsed.data.mode as "online" | "in_person",
      depositAmount: parsed.data.depositAmount,
      status: "pending",
    },
    include: {
      user: { select: { email: true, username: true, name: true } },
      escortProfile: { select: { displayName: true } },
    },
  });

  const slot = `${parsed.data.startTime}–${parsed.data.endTime}`;
  const dateStr = date.toLocaleDateString();
  const userIdent = session.user.email ?? session.user.name ?? "";
  const escortIdent = escort.user.email ?? escort.user.username ?? "";
  await sendBookingRequested(
    userIdent,
    escortIdent,
    escort.displayName,
    dateStr,
    slot
  );
  await sendEscortNewBooking(
    escortIdent,
    escort.displayName,
    dateStr,
    slot
  );

  return { ok: true, bookingId: booking.id };
}

const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

const uploadDepositSchema = z.object({
  bookingId: z.string().min(1),
  amount: z.number().positive(),
  paymentMethod: z.enum(["telebirr", "bank_transfer", "cash"]),
});

export async function uploadDeposit(
  _prevState: BookingActionResult,
  formData: FormData
): Promise<BookingActionResult> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in." };
  }

  const receiptFile = formData.get("receipt") as File | null;
  if (!receiptFile || !(receiptFile instanceof File) || !receiptFile.type.startsWith("image/")) {
    return { ok: false, error: "Please upload an image receipt." };
  }
  if (receiptFile.size > MAX_RECEIPT_BYTES) {
    return { ok: false, error: "Receipt image must be under 5MB." };
  }

  const parsed = uploadDepositSchema.safeParse({
    bookingId: formData.get("bookingId"),
    amount: Number(formData.get("amount")),
    paymentMethod: formData.get("paymentMethod"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid deposit details." };
  }

  const booking = await prisma.booking.findFirst({
    where: { id: parsed.data.bookingId, userId: session.user.id, status: "pending" },
    include: { escortProfile: { include: { user: { select: { email: true, username: true } } } } },
  });
  if (!booking) {
    return { ok: false, error: "Booking not found or already processed." };
  }

  const uploadResult = await uploadImage(receiptFile, {
    folder: "deposit-receipts",
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 85,
    format: "auto",
  });

  if (!uploadResult.success || !uploadResult.image) {
    return { ok: false, error: uploadResult.error ?? "Failed to upload receipt." };
  }

  await prisma.depositPayment.create({
    data: {
      bookingId: booking.id,
      userId: session.user.id,
      amount: parsed.data.amount,
      paymentMethod: parsed.data.paymentMethod as "telebirr" | "bank_transfer" | "cash",
      receiptUrl: uploadResult.image.url,
      receiptPublicId: uploadResult.image.publicId,
      status: "pending",
    },
  });

  await sendDepositSubmitted(
    session.user.email ?? session.user.name ?? "",
    session.user.name ?? "User",
    parsed.data.amount,
    booking.id
  );

  return { ok: true, bookingId: booking.id };
}

export async function escortAcceptBooking(bookingId: string): Promise<BookingActionResult> {
  const session = await getAuthSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const profile = await prisma.escortProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return { ok: false, error: "Escort profile not found." };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, escortId: profile.id, status: "approved" },
  });
  if (!booking) return { ok: false, error: "Booking not found or not approved." };

  await prisma.booking.update({
    where: { id: bookingId },
    data: { escortAcceptedAt: new Date() },
  });
  return { ok: true };
}

export async function escortRejectBooking(bookingId: string): Promise<BookingActionResult> {
  const session = await getAuthSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const profile = await prisma.escortProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return { ok: false, error: "Escort profile not found." };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, escortId: profile.id, status: "approved" },
  });
  if (!booking) return { ok: false, error: "Booking not found or not approved." };

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "canceled" },
  });
  return { ok: true };
}

export async function escortCompleteBooking(bookingId: string): Promise<BookingActionResult> {
  const session = await getAuthSession();
  if (!session?.user?.id) return { ok: false, error: "Not signed in." };

  const profile = await prisma.escortProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) return { ok: false, error: "Escort profile not found." };

  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, escortId: profile.id, status: "approved" },
    include: { user: { select: { email: true, username: true, name: true } } },
  });
  if (!booking) return { ok: false, error: "Booking not found or not approved." };

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "completed" },
  });

  const userIdent = booking.user.email ?? booking.user.username ?? "";
  await sendBookingCompleted(
    userIdent,
    booking.user.name ?? "Client",
    profile.displayName
  );
  return { ok: true };
}
