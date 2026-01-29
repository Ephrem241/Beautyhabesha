"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type PaymentAccountActionResult = { ok: boolean; error?: string };

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

const createSchema = z.object({
  type: z.enum(["bank", "mobile_money"]),
  accountName: z.string().min(1, "Account name is required").max(120),
  accountNumber: z.string().min(1, "Account number is required").max(60),
  provider: z.string().max(60).optional().or(z.literal("")),
  displayOrder: z.coerce.number().int().min(0),
  isActive: z.coerce.boolean(),
});

const updateSchema = createSchema.extend({
  id: z.string().min(1),
});

function checkbox(formData: FormData, name: string) {
  return formData.getAll(name).includes("on") || formData.get(name) === "true";
}

export async function createPaymentAccount(
  _prev: PaymentAccountActionResult,
  formData: FormData
): Promise<PaymentAccountActionResult> {
  await requireAdmin();

  const parsed = createSchema.safeParse({
    type: formData.get("type"),
    accountName: formData.get("accountName"),
    accountNumber: formData.get("accountNumber"),
    provider: formData.get("provider") || undefined,
    displayOrder: formData.get("displayOrder") ?? 0,
    isActive: checkbox(formData, "isActive"),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const parts = [
      ...flat.formErrors,
      ...(Object.values(flat.fieldErrors).flat().filter(Boolean) as string[]),
    ];
    return { ok: false, error: parts.length ? parts.join(" ") : "Invalid input." };
  }

  await prisma.paymentAccount.create({
    data: {
      type: parsed.data.type,
      accountName: parsed.data.accountName.trim(),
      accountNumber: parsed.data.accountNumber.trim(),
      provider: parsed.data.provider?.trim() || null,
      displayOrder: parsed.data.displayOrder,
      isActive: parsed.data.isActive,
    },
  });
  redirect("/dashboard/admin/payment-accounts");
}

export async function updatePaymentAccount(
  _prev: PaymentAccountActionResult,
  formData: FormData
): Promise<PaymentAccountActionResult> {
  await requireAdmin();

  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    return { ok: false, error: "Missing payment account id." };
  }

  const parsed = updateSchema.safeParse({
    id,
    type: formData.get("type"),
    accountName: formData.get("accountName"),
    accountNumber: formData.get("accountNumber"),
    provider: formData.get("provider") || undefined,
    displayOrder: formData.get("displayOrder") ?? 0,
    isActive: checkbox(formData, "isActive"),
  });

  if (!parsed.success) {
    const flat = parsed.error.flatten();
    const parts = [
      ...flat.formErrors,
      ...(Object.values(flat.fieldErrors).flat().filter(Boolean) as string[]),
    ];
    return { ok: false, error: parts.length ? parts.join(" ") : "Invalid input." };
  }

  await prisma.paymentAccount.update({
    where: { id: parsed.data.id },
    data: {
      type: parsed.data.type,
      accountName: parsed.data.accountName.trim(),
      accountNumber: parsed.data.accountNumber.trim(),
      provider: parsed.data.provider?.trim() || null,
      displayOrder: parsed.data.displayOrder,
      isActive: parsed.data.isActive,
    },
  });
  redirect("/dashboard/admin/payment-accounts");
}

export async function deletePaymentAccount(id: string): Promise<PaymentAccountActionResult> {
  await requireAdmin();
  if (!id) return { ok: false, error: "Missing id." };
  try {
    await prisma.paymentAccount.delete({ where: { id } });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to delete payment account." };
  }
}

export async function togglePaymentAccountActive(id: string): Promise<PaymentAccountActionResult> {
  await requireAdmin();
  if (!id) return { ok: false, error: "Missing id." };
  try {
    const row = await prisma.paymentAccount.findUnique({ where: { id } });
    if (!row) return { ok: false, error: "Payment account not found." };
    await prisma.paymentAccount.update({
      where: { id },
      data: { isActive: !row.isActive },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Failed to update." };
  }
}
