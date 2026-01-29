"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type PlanActionResult = { ok: boolean; error?: string };

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

const createSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(1).max(80).regex(/^[a-z0-9_]+$/, "Slug: lowercase, numbers, underscores only"),
  price: z.coerce.number().min(0),
  currency: z.string().min(1).max(10).default("ETB"),
  billingCycle: z.enum(["monthly", "yearly"]),
  durationDays: z.coerce.number().int().min(0),
  features: z
    .union([z.string(), z.null()])
    .transform((s) => {
      const raw = (s ?? "").toString().trim();
      if (!raw) return [];
      return raw.split("\n").map((x) => x.trim()).filter(Boolean);
    }),
  isPopular: z.coerce.boolean(),
  isRecommended: z.coerce.boolean(),
  isActive: z.coerce.boolean(),
});

const updateSchema = createSchema.extend({
  id: z.string().min(1),
});

export async function createPlan(
  _prev: PlanActionResult,
  formData: FormData
): Promise<PlanActionResult> {
  await requireAdmin();

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    price: formData.get("price"),
    currency: formData.get("currency") || "ETB",
    billingCycle: formData.get("billingCycle") || "monthly",
    durationDays: formData.get("durationDays"),
    features: formData.get("features"),
    isPopular: formData.get("isPopular") === "on" || formData.get("isPopular") === "true",
    isRecommended: formData.get("isRecommended") === "on" || formData.get("isRecommended") === "true",
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors.join(" ") || "Invalid input." };
  }

  const existing = await prisma.subscriptionPlan.findUnique({
    where: { slug: parsed.data.slug },
  });
  if (existing) {
    return { ok: false, error: "A plan with this slug already exists." };
  }

  await prisma.subscriptionPlan.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      price: parsed.data.price,
      currency: parsed.data.currency,
      billingCycle: parsed.data.billingCycle as "monthly" | "yearly",
      durationDays: parsed.data.durationDays,
      features: parsed.data.features,
      isPopular: parsed.data.isPopular,
      isRecommended: parsed.data.isRecommended,
      isActive: parsed.data.isActive,
    },
  });
  redirect("/dashboard/admin/plans");
}

export async function updatePlan(
  _prev: PlanActionResult,
  formData: FormData
): Promise<PlanActionResult> {
  await requireAdmin();

  const id = formData.get("id");
  if (!id || typeof id !== "string") {
    return { ok: false, error: "Missing plan id." };
  }

  const parsed = updateSchema.safeParse({
    id,
    name: formData.get("name"),
    slug: formData.get("slug"),
    price: formData.get("price"),
    currency: formData.get("currency") || "ETB",
    billingCycle: formData.get("billingCycle") || "monthly",
    durationDays: formData.get("durationDays"),
    features: formData.get("features"),
    isPopular: formData.get("isPopular") === "on" || formData.get("isPopular") === "true",
    isRecommended: formData.get("isRecommended") === "on" || formData.get("isRecommended") === "true",
    isActive: formData.get("isActive") === "on" || formData.get("isActive") === "true",
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors.join(" ") || "Invalid input." };
  }

  const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
  if (!plan || plan.deletedAt) {
    return { ok: false, error: "Plan not found." };
  }

  const duplicate = await prisma.subscriptionPlan.findFirst({
    where: { slug: parsed.data.slug, id: { not: id }, deletedAt: null },
  });
  if (duplicate) {
    return { ok: false, error: "Another plan with this slug exists." };
  }

  await prisma.subscriptionPlan.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      price: parsed.data.price,
      currency: parsed.data.currency,
      billingCycle: parsed.data.billingCycle as "monthly" | "yearly",
      durationDays: parsed.data.durationDays,
      features: parsed.data.features,
      isPopular: parsed.data.isPopular,
      isRecommended: parsed.data.isRecommended,
      isActive: parsed.data.isActive,
    },
  });
  return { ok: true };
}

export async function togglePlanFlag(
  planId: string,
  flag: "isActive" | "isPopular" | "isRecommended"
): Promise<PlanActionResult> {
  await requireAdmin();

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });
  if (!plan || plan.deletedAt) {
    return { ok: false, error: "Plan not found." };
  }

  const next = !(plan as { isActive?: boolean; isPopular?: boolean; isRecommended?: boolean })[flag];
  await prisma.subscriptionPlan.update({
    where: { id: planId },
    data: { [flag]: next },
  });
  return { ok: true };
}

export async function deletePlan(planId: string): Promise<PlanActionResult> {
  await requireAdmin();

  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id: planId },
  });
  if (!plan) {
    return { ok: false, error: "Plan not found." };
  }
  if (plan.deletedAt) {
    return { ok: true };
  }

  await prisma.subscriptionPlan.update({
    where: { id: planId },
    data: { deletedAt: new Date(), isActive: false },
  });
  return { ok: true };
}
