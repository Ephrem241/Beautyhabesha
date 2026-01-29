"use server";

import { z } from "zod";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary-utils";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB

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

  // Escorts must upload a profile photo
  const isEscort = parsed.data.role === "escort";
  const photoFile = formData.get("profilePhoto");
  if (isEscort) {
    if (!(photoFile instanceof File) || !photoFile.size) {
      return {
        error:
          "Please upload a profile photo. Admin will review it before approving your account.",
      };
    }
    if (!photoFile.type.startsWith("image/")) {
      return { error: "Profile photo must be an image file." };
    }
    if (photoFile.size > MAX_PHOTO_BYTES) {
      return { error: "Profile photo must be smaller than 5MB." };
    }
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return { error: "An account with this email already exists." };
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(parsed.data.password, 10);

  let profileImage: { url: string; publicId: string } | null = null;
  if (isEscort && photoFile instanceof File) {
    const upload = await uploadImage(photoFile, {
      folder: "escort-profiles",
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 85,
      format: "auto",
    });
    if (!upload.success || !upload.image) {
      return {
        error: upload.error ?? "Failed to upload profile photo. Please try again.",
      };
    }
    profileImage = upload.image;
  }

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: normalizedEmail,
        name: parsed.data.name,
        password: hashedPassword,
        role: parsed.data.role,
        currentPlan: "Normal",
        subscriptionStatus: "inactive",
      },
    });

    if (isEscort && profileImage) {
      await tx.escortProfile.create({
        data: {
          userId: user.id,
          displayName: parsed.data.name,
          images: [profileImage] as unknown as object,
          status: "pending",
        },
      });
    }
  });

  return { success: true };
}
