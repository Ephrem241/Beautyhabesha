"use server";

import { z } from "zod";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["user", "escort"]),
});

export type RegisterResult = {
  error?: string;
  success?: boolean;
};

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: "Please fill out all fields correctly." };
  }

  const normalizedEmail = parsed.data.email.toLowerCase().trim();

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  // Create user
  await prisma.user.create({
    data: {
      email: normalizedEmail,
      name: parsed.data.name,
      password: hashedPassword,
      role: parsed.data.role,
      currentPlan: "Normal",
      subscriptionStatus: "inactive",
    },
  });

  return { success: true };
}
