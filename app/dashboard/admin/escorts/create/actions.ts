"use server";

import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  displayName: z.string().min(2).max(60).optional(),
  password: z.string().min(6),
});

export type CreateEscortResult = {
  error?: string;
  ok?: boolean;
};

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
  return session.user.id;
}

export async function createEscortByAdmin(
  _prev: CreateEscortResult,
  formData: FormData
): Promise<CreateEscortResult> {
  const adminId = await requireAdmin();

  const parsed = createSchema.safeParse({
    email: formData.get("email"),
    name: formData.get("name"),
    displayName: formData.get("displayName") || undefined,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Please fill all required fields. Email valid, name 2–100 chars, password 6+." };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const displayName = parsed.data.displayName?.trim() || parsed.data.name.trim();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        name: parsed.data.name,
        password: hashedPassword,
        role: "escort",
        currentPlan: "Normal",
        subscriptionStatus: "inactive",
      },
    });
    await tx.escortProfile.create({
      data: {
        userId: user.id,
        displayName,
        status: "approved",
        approvedAt: new Date(),
        approvedBy: adminId,
      },
    });
  });

  redirect("/dashboard/admin/escorts?created=1");
}
