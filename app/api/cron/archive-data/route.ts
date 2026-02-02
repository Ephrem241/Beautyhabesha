import { NextResponse } from "next/server";
import { archiveMessagesOlderThan, archivePaymentsOlderThan } from "@/lib/archive";

const ARCHIVE_DAYS = 90;

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
