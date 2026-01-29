"use server";

import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type ReportResult = { ok: boolean; error?: string };

const schema = z.object({
  escortId: z.string().min(1),
  reason: z.enum(["fake_profile", "underage", "abuse", "scam"]),
  details: z.string().max(1000).optional().or(z.literal("")),
});

export async function submitReport(
  _prevState: ReportResult,
  formData: FormData
): Promise<ReportResult> {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return { ok: false, error: "You must be signed in to report a profile." };
  }

  const parsed = schema.safeParse({
    escortId: formData.get("escortId"),
    reason: formData.get("reason"),
    details: formData.get("details"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid report. Choose a reason." };
  }

  const escort = await prisma.escortProfile.findUnique({
    where: { id: parsed.data.escortId },
  });
  if (!escort) {
    return { ok: false, error: "Profile not found." };
  }

  await prisma.report.create({
    data: {
      escortProfileId: parsed.data.escortId,
      reporterUserId: session.user.id,
      reason: parsed.data.reason as "fake_profile" | "underage" | "abuse" | "scam",
      details: parsed.data.details?.trim() || null,
      status: "pending",
    },
  });

  return { ok: true };
}
