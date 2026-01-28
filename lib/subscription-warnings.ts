import "server-only";

export type WarningResult = {
  warningsSent: number;
};

export async function sendExpiryWarnings(): Promise<WarningResult> {
  // Email notifications removed - function kept for compatibility
  // but no longer sends emails
  return { warningsSent: 0 };
}
