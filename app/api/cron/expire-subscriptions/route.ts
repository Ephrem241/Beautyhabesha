import { NextResponse } from "next/server";

import { processAutoRenewals } from "@/lib/auto-renew";
import { expireSubscriptions } from "@/lib/subscription-expiration";
import { sendExpiryWarnings } from "@/lib/subscription-warnings";

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  return !!secret && authHeader === `Bearer ${secret}`;
}

async function run() {
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

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return run();
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return run();
}
