"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type UserActionResult = {
  ok: boolean;
  error?: string;
};

const updateRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["admin", "escort", "user"]),
});

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export async function updateUserRole(
  _prevState: UserActionResult,
  formData: FormData
): Promise<UserActionResult> {
  await requireAdmin();

  const parsed = updateRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const user = await prisma.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role },
  });
  
  if (!user) {
    return { ok: false, error: "User not found." };
  }

  return { ok: true };
}
