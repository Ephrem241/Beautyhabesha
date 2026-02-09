import { NextResponse } from "next/server";
import { archiveMessagesOlderThan, archivePaymentsOlderThan } from "@/lib/archive";

const ARCHIVE_DAYS = 90;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  return !!secret && authHeader === `Bearer ${secret}`;
}

async function run() {
  const [messagesResult, paymentsResult] = await Promise.all([
    archiveMessagesOlderThan(ARCHIVE_DAYS),
    archivePaymentsOlderThan(ARCHIVE_DAYS),
  ]);
  return NextResponse.json({
    ok: true,
    messages: messagesResult,
    payments: paymentsResult,
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
