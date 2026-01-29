/**
 * Email notifications for auto-renew and subscription lifecycle.
 * Wire to Resend, SendGrid, or your provider; stubs log for now.
 */

export type EmailResult = { ok: boolean; error?: string };

export async function sendAutoRenewInitiated(
  to: string,
  displayName: string,
  endDate: Date
): Promise<EmailResult> {
  // TODO: Wire to Resend/SendGrid. Subject: "Auto-renew initiated – payment pending"
  if (process.env.NODE_ENV === "development") {
    console.log("[email] Auto-renew initiated:", { to, displayName, endDate: endDate.toISOString() });
  }
  return { ok: true };
}

export async function sendPaymentPendingApproval(
  to: string,
  displayName: string
): Promise<EmailResult> {
  // TODO: Wire to provider. Subject: "Payment pending approval"
  if (process.env.NODE_ENV === "development") {
    console.log("[email] Payment pending approval:", { to, displayName });
  }
  return { ok: true };
}

export async function sendRenewalSuccessful(
  to: string,
  displayName: string,
  endDate: Date
): Promise<EmailResult> {
  // TODO: Wire to provider. Subject: "Renewal successful"
  if (process.env.NODE_ENV === "development") {
    console.log("[email] Renewal successful:", { to, displayName, endDate: endDate.toISOString() });
  }
  return { ok: true };
}

export async function sendRenewalFailed(
  to: string,
  displayName: string,
  reason?: string
): Promise<EmailResult> {
  // TODO: Wire to provider. Subject: "Renewal failed"
  if (process.env.NODE_ENV === "development") {
    console.log("[email] Renewal failed:", { to, displayName, reason });
  }
  return { ok: true };
}

// ----- Booking lifecycle -----

export async function sendBookingRequested(
  userEmail: string,
  escortEmail: string,
  escortDisplayName: string,
  date: string,
  slot: string
): Promise<EmailResult> {
  if (process.env.NODE_ENV === "development") {
    console.log("[email] Booking requested:", { userEmail, escortEmail, escortDisplayName, date, slot });
  }
  return { ok: true };
}

export async function sendDepositSubmitted(
  to: string,
  displayName: string,
  amount: number,
  bookingId: string
): Promise<EmailResult> {
  if (process.env.NODE_ENV === "development") {
    console.log("[email] Deposit submitted:", { to, displayName, amount, bookingId });
  }
  return { ok: true };
}

export async function sendBookingApproved(
  to: string,
  displayName: string,
  escortDisplayName: string,
  date: string,
  slot: string
): Promise<EmailResult> {
  if (process.env.NODE_ENV === "development") {
    console.log("[email] Booking approved:", { to, displayName, escortDisplayName, date, slot });
  }
  return { ok: true };
}

export async function sendBookingRejected(
  to: string,
  displayName: string,
  reason?: string
): Promise<EmailResult> {
  if (process.env.NODE_ENV === "development") {
    console.log("[email] Booking rejected:", { to, displayName, reason });
  }
  return { ok: true };
}

export async function sendBookingCompleted(
  to: string,
  displayName: string,
  escortDisplayName: string
): Promise<EmailResult> {
  if (process.env.NODE_ENV === "development") {
    console.log("[email] Booking completed:", { to, displayName, escortDisplayName });
  }
  return { ok: true };
}

export async function sendEscortNewBooking(
  to: string,
  escortDisplayName: string,
  date: string,
  slot: string
): Promise<EmailResult> {
  if (process.env.NODE_ENV === "development") {
    console.log("[email] Escort new booking:", { to, escortDisplayName, date, slot });
  }
  return { ok: true };
}
