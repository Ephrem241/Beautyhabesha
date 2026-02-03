"use server";

import { getAuthSession } from "@/lib/auth";
import {
  CONSENT_TYPES,
  CONSENT_VERSION,
  hasEscortConsentComplete,
  recordConsent,
  type ConsentType,
} from "@/lib/consent";

export type ConsentResult = { ok: boolean; error?: string };

export async function submitConsent(
  _prevState: ConsentResult,
  formData: FormData
): Promise<ConsentResult> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in." };
  }
  if (session.user.role !== "escort") {
    return { ok: false, error: "Consent is required only for escorts." };
  }

  const required = ["terms", "content", "18_plus", "ownership"] as const;
  for (const key of required) {
    if (formData.get(key) !== "on") {
      return { ok: false, error: `You must accept all agreements including "${key}".` };
    }
  }

  const ip =
    typeof process !== "undefined" && process.env?.CLIENT_IP
      ? process.env.CLIENT_IP
      : null;
  // In production, pass ip from headers (e.g. x-forwarded-for) via middleware or route.

  for (const type of CONSENT_TYPES) {
    await recordConsent(session.user.id, type as ConsentType, CONSENT_VERSION, ip);
  }

  return { ok: true };
}

export async function requireEscortConsent(): Promise<boolean> {
  const session = await getAuthSession();
  if (!session?.user?.id || session.user.role !== "escort") return true;
  return hasEscortConsentComplete(session.user.id);
}
