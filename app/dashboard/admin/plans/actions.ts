"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const planSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  price: z.coerce.number().min(0),
  durationDays: z.coerce.number().int().min(0),
  priority: z.coerce.number().int().min(0),
});

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export async function createOrUpdatePlan(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = planSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    price: formData.get("price"),
    durationDays: formData.get("durationDays"),
    priority: formData.get("priority"),
  });

  if (!parsed.success) {
    console.error("Invalid plan data submitted:", parsed.error.flatten());
    return;
  }

  const { id, name, price, durationDays, priority } = parsed.data;

  if (id) {
    await prisma.plan.update({
      where: { id },
      data: { name, price, durationDays, priority },
    });
  } else {
    await prisma.plan.create({
      data: { name, price, durationDays, priority },
    });
  }
  redirect("/dashboard/admin/plans");
}

export async function deletePlan(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    console.error("Invalid plan id for delete:", id);
    return;
  }

  // Prevent deleting core membership tiers used by the app
  const protectedNames = new Set(["Normal", "VIP", "Platinum"]);
  const plan = await prisma.plan.findUnique({ where: { id } });
  if (plan && protectedNames.has(plan.name)) {
    console.warn(
      `Attempted to delete protected plan "${plan.name}". Operation blocked.`
    );
    return;
  }

  await prisma.plan.delete({ where: { id } });
  redirect("/dashboard/admin/plans");
}

