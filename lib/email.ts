/**
 * Email notifications via Resend.
 * When RESEND_API_KEY is unset, functions no-op (log in dev, return ok: true).
 */

import { Resend } from "resend";
import { prisma } from "@/lib/db";

export type EmailResult = { ok: boolean; error?: string };

const DEFAULT_FROM = "Habesha Escorts <onboarding@resend.dev>";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || typeof key !== "string" || key.trim() === "") {
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(key);
  }
  return resendClient;
}

async function sendViaResend(options: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}): Promise<EmailResult> {
  const client = getResendClient();
  if (!client) {
    if (process.env.NODE_ENV === "development") {
      console.log("[email] Resend not configured, skipping send:", options.subject);
    }
    return { ok: true };
  }
  const from = process.env.EMAIL_FROM?.trim() || DEFAULT_FROM;
  try {
    const { data, error } = await client.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
    if (error) {
      console.error("[email] Resend error:", error);
      return { ok: false, error: error.message || String(error) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[email] Resend send failed:", message);
    return { ok: false, error: message };
  }
}

/** Best-effort log to EmailLog; never throws. */
export async function logEmail(
  to: string,
  subject: string,
  type: string,
  metadata?: object
): Promise<void> {
  try {
    await prisma.emailLog.create({
      data: { to, subject, type, metadata: metadata ?? undefined },
    });
  } catch (err) {
    console.error("[email] EmailLog create failed:", err);
  }
}

/** Resolve admin emails from ADMIN_EMAIL / ADMIN_EMAILS env or DB. */
export async function getAdminEmails(): Promise<string[]> {
  const fromEnv =
    process.env.ADMIN_EMAILS?.trim() ||
    process.env.ADMIN_EMAIL?.trim() ||
    "";
  if (fromEnv) {
    return fromEnv.split(",").map((e) => e.trim()).filter(Boolean);
  }
  const users = await prisma.user.findMany({
    where: { role: "admin" },
    select: { email: true },
  });
  return users.map((u) => u.email).filter((e): e is string => e != null && e.trim() !== "");
}

// ----- Subscription / auto-renew -----

export async function sendAutoRenewInitiated(
  to: string,
  displayName: string,
  endDate: Date
): Promise<EmailResult> {
  if (!getResendClient() && process.env.NODE_ENV === "development") {
    console.log("[email] Auto-renew initiated:", { to, displayName, endDate: endDate.toISOString() });
  }
  return sendViaResend({
    to,
    subject: "Auto-renew initiated – payment pending",
    text: `Hi ${displayName},\n\nYour subscription is set to auto-renew. Renewal date: ${endDate.toLocaleDateString()}.\n\nPayment is pending approval.`,
  });
}

export async function sendPaymentPendingApproval(
  to: string,
  displayName: string
): Promise<EmailResult> {
  if (!getResendClient() && process.env.NODE_ENV === "development") {
    console.log("[email] Payment pending approval:", { to, displayName });
  }
  const subject = "Payment pending approval";
  const result = await sendViaResend({
    to,
    subject,
    text: `Hi ${displayName},\n\nYour payment has been received and is pending approval. We will notify you once it is processed.`,
  });
  if (result.ok) {
    await logEmail(to, subject, "payment_upload_user", { displayName });
  }
  return result;
}

export type AdminNewPaymentDetails = {
  userName?: string;
  userEmail?: string;
  planName: string;
  amount: number;
  paymentId: string;
};

export async function sendAdminNewPaymentUploaded(
  adminEmails: string[],
  details: AdminNewPaymentDetails
): Promise<EmailResult> {
  const filtered = adminEmails.filter((e) => typeof e === "string" && e.trim().length > 0);
  if (filtered.length === 0) {
    return { ok: true };
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  const paymentsUrl = `${siteUrl}/dashboard/admin/payments`;
  const subject = "New payment proof uploaded";
  const text = [
    "A user has uploaded a new payment proof.",
    "",
    `User: ${details.userName ?? details.userEmail ?? "—"}`,
    `Email: ${details.userEmail ?? "—"}`,
    `Plan: ${details.planName}`,
    `Amount: ${details.amount}`,
    `Payment ID: ${details.paymentId}`,
    "",
    `Review and approve: ${paymentsUrl}`,
  ].join("\n");
  if (!getResendClient() && process.env.NODE_ENV === "development") {
    console.log("[email] Admin new payment uploaded:", { to: filtered, ...details });
  }
  const result = await sendViaResend({
    to: filtered,
    subject,
    text,
  });
  if (result.ok) {
    await logEmail(filtered.join(", "), subject, "payment_upload_admin", {
      paymentId: details.paymentId,
      userName: details.userName,
      userEmail: details.userEmail,
      planName: details.planName,
      amount: details.amount,
    });
  }
  return result;
}

export async function sendRenewalSuccessful(
  to: string,
  displayName: string,
  endDate: Date
): Promise<EmailResult> {
  if (!getResendClient() && process.env.NODE_ENV === "development") {
    console.log("[email] Renewal successful:", { to, displayName, endDate: endDate.toISOString() });
  }
  return sendViaResend({
    to,
    subject: "Renewal successful",
    text: `Hi ${displayName},\n\nYour subscription has been renewed successfully. Valid until: ${endDate.toLocaleDateString()}.`,
  });
}

export async function sendRenewalFailed(
  to: string,
  displayName: string,
  reason?: string
): Promise<EmailResult> {
  if (!getResendClient() && process.env.NODE_ENV === "development") {
    console.log("[email] Renewal failed:", { to, displayName, reason });
  }
  return sendViaResend({
    to,
    subject: "Renewal failed",
    text: `Hi ${displayName},\n\nYour subscription renewal could not be completed.${reason ? ` Reason: ${reason}` : ""}\n\nPlease update your payment method or contact support.`,
  });
}

// ----- Booking lifecycle -----

export async function sendBookingRequested(
  userEmail: string,
  escortEmail: string,
  escortDisplayName: string,
  date: string,
  slot: string
): Promise<EmailResult> {
  if (!getResendClient() && process.env.NODE_ENV === "development") {
    console.log("[email] Booking requested:", { userEmail, escortEmail, escortDisplayName, date, slot });
  }
  const userResult = await sendViaResend({
    to: userEmail,
    subject: `Your booking request for ${date}`,
    text: `Your booking request has been sent for ${date} (${slot}) with ${escortDisplayName}. You will be notified when it is confirmed.`,
  });
  if (!userResult.ok) return userResult;
  return sendViaResend({
    to: escortEmail,
    subject: `New booking request for ${date} (${slot})`,
    text: `You have a new booking request for ${date}, ${slot}. Please check your dashboard to accept or decline.`,
  });
}

export async function sendDepositSubmitted(
  to: string,
  displayName: string,
  amount: number,
  bookingId: string
): Promise<EmailResult> {
  if (!getResendClient() && process.env.NODE_ENV === "development") {
    console.log("[email] Deposit submitted:", { to, displayName, amount, bookingId });
  }
  return sendViaResend({
    to,
    subject: "Deposit receipt received",
    text: `Hi ${displayName},\n\nWe have received your deposit of ${amount} for booking ${bookingId}. It is pending approval.`,
  });
}

export async function sendBookingApproved(
  to: string,
  displayName: string,
  escortDisplayName: string,
  date: string,
  slot: string
): Promise<EmailResult> {
  if (!getResendClient() && process.env.NODE_ENV === "development") {
    console.log("[email] Booking approved:", { to, displayName, escortDisplayName, date, slot });
  }
  return sendViaResend({
    to,
    subject: "Booking approved",
    text: `Hi ${displayName},\n\nYour booking with ${escortDisplayName} for ${date} (${slot}) has been approved.`,
  });
}

export async function sendBookingRejected(
  to: string,
  displayName: string,
  reason?: string
): Promise<EmailResult> {
  if (!getResendClient() && process.env.NODE_ENV === "development") {
    console.log("[email] Booking rejected:", { to, displayName, reason });
  }
  return sendViaResend({
    to,
    subject: "Booking update",
    text: `Hi ${displayName},\n\nYour booking request could not be confirmed.${reason ? ` Reason: ${reason}` : ""}`,
  });
}

export async function sendBookingCompleted(
  to: string,
  displayName: string,
  escortDisplayName: string
): Promise<EmailResult> {
  if (!getResendClient() && process.env.NODE_ENV === "development") {
    console.log("[email] Booking completed:", { to, displayName, escortDisplayName });
  }
  return sendViaResend({
    to,
    subject: "Booking completed",
    text: `Hi ${displayName},\n\nYour booking with ${escortDisplayName} has been marked as completed. Thank you!`,
  });
}

export async function sendEscortNewBooking(
  to: string,
  escortDisplayName: string,
  date: string,
  slot: string
): Promise<EmailResult> {
  if (!getResendClient() && process.env.NODE_ENV === "development") {
    console.log("[email] Escort new booking:", { to, escortDisplayName, date, slot });
  }
  return sendViaResend({
    to,
    subject: `New booking for ${date} (${slot})`,
    text: `Hi ${escortDisplayName},\n\nYou have a new booking for ${date}, ${slot}. Please check your dashboard.`,
  });
}
