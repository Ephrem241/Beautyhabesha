import { NextResponse } from "next/server";

import { expireSubscriptions } from "@/lib/subscription-expiration";
import { sendExpiryWarnings } from "@/lib/subscription-warnings";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Run both expiration and warning checks
  const [expirationResult, warningResult] = await Promise.all([
    expireSubscriptions(),
    sendExpiryWarnings(),
  ]);

  return NextResponse.json({
    ok: true,
    expiration: expirationResult,
    warnings: warningResult,
  });
}
