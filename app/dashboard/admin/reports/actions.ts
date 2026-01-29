"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type ReportActionResult = { ok: boolean; error?: string };

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
  return session.user.id;
}

const idSchema = z.object({ reportId: z.string().min(1) });

export async function markReportReviewed(
  _prevState: ReportActionResult,
  formData: FormData
): Promise<ReportActionResult> {
  const adminId = await requireAdmin();
  const parsed = idSchema.safeParse({ reportId: formData.get("reportId") });
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const report = await prisma.report.findUnique({
    where: { id: parsed.data.reportId },
  });
  if (!report) return { ok: false, error: "Report not found." };

  await prisma.report.update({
    where: { id: parsed.data.reportId },
    data: { status: "reviewed", reviewedAt: new Date(), reviewedBy: adminId },
  });
  return { ok: true };
}

export async function disableReportedProfile(
  _prevState: ReportActionResult,
  formData: FormData
): Promise<ReportActionResult> {
  const adminId = await requireAdmin();
  const parsed = idSchema.safeParse({ reportId: formData.get("reportId") });
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const report = await prisma.report.findUnique({
    where: { id: parsed.data.reportId },
    include: { escortProfile: true },
  });
  if (!report) return { ok: false, error: "Report not found." };

  await prisma.$transaction([
    prisma.escortProfile.update({
      where: { id: report.escortProfileId },
      data: { status: "suspended" },
    }),
    prisma.report.update({
      where: { id: parsed.data.reportId },
      data: { status: "action_taken", reviewedAt: new Date(), reviewedBy: adminId },
    }),
  ]);
  return { ok: true };
}

export async function banReportedUser(
  _prevState: ReportActionResult,
  formData: FormData
): Promise<ReportActionResult> {
  const adminId = await requireAdmin();
  const parsed = idSchema.safeParse({ reportId: formData.get("reportId") });
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const report = await prisma.report.findUnique({
    where: { id: parsed.data.reportId },
    include: { escortProfile: { select: { userId: true } } },
  });
  if (!report) return { ok: false, error: "Report not found." };

  const userId = report.escortProfile.userId;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { bannedAt: new Date() },
    }),
    prisma.escortProfile.update({
      where: { id: report.escortProfileId },
      data: { status: "suspended" },
    }),
    prisma.report.update({
      where: { id: parsed.data.reportId },
      data: { status: "action_taken", reviewedAt: new Date(), reviewedBy: adminId },
    }),
  ]);
  return { ok: true };
}
