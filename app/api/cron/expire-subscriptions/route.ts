import { NextResponse } from "next/server";

import { processAutoRenewals } from "@/lib/auto-renew";
import { expireSubscriptions } from "@/lib/subscription-expiration";
import { sendExpiryWarnings } from "@/lib/subscription-warnings";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [expirationResult, warningResult, autoRenewResult] = await Promise.all([
    expireSubscriptions(),
    sendExpiryWarnings(),
    processAutoRenewals(),
  ]);

  return NextResponse.json({
    ok: true,
    expiration: expirationResult,
    warnings: warningResult,
    autoRenew: autoRenewResult,
  });
}
