import { prisma } from "@/lib/db";

export const CONSENT_VERSION = "1";

export const CONSENT_TYPES = [
  "terms",
  "content",
  "18_plus",
  "ownership",
] as const;

export type ConsentType = (typeof CONSENT_TYPES)[number];

/**
 * Check if user has accepted the required consent for a given type.
 */
export async function hasUserAccepted(
  userId: string,
  type: ConsentType,
  version: string = CONSENT_VERSION
): Promise<boolean> {
  const r = await prisma.consentRecord.findFirst({
    where: { userId, type, version },
    orderBy: { acceptedAt: "desc" },
  });
  return !!r;
}

/**
 * Check if user has accepted all required consents for escorts.
 */
export async function hasEscortConsentComplete(userId: string): Promise<boolean> {
  for (const type of CONSENT_TYPES) {
    const ok = await hasUserAccepted(userId, type);
    if (!ok) return false;
  }
  return true;
}

/**
 * Record consent acceptance.
 */
export async function recordConsent(
  userId: string,
  type: ConsentType,
  version: string = CONSENT_VERSION,
  ip?: string | null
): Promise<void> {
  await prisma.consentRecord.create({
    data: { userId, type, version, ip: ip ?? undefined },
  });
}

/**
 * Get consent history for a user (admin).
 */
export async function getConsentHistory(userId: string) {
  return prisma.consentRecord.findMany({
    where: { userId },
    orderBy: { acceptedAt: "desc" },
  });
}
