import { NextResponse } from "next/server";

import { getAuthSession } from "@/lib/auth";
import { getUserPlan } from "@/lib/plan-access";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plan = await getUserPlan(session.user.id);
  return NextResponse.json({ plan });
}
