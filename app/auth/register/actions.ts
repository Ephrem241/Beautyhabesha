"use server";

import { z } from "zod";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary-utils";
import { DEFAULT_ESCORT_TELEGRAM, DEFAULT_ESCORT_WHATSAPP } from "@/lib/escort-defaults";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
const MIN_ESCORT_IMAGES = 3;
const MAX_ESCORT_IMAGES = 12;

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

  // Escorts must upload 3–12 images; first image is the profile photo
  const isEscort = parsed.data.role === "escort";
  const photoFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (isEscort) {
    if (photoFiles.length < MIN_ESCORT_IMAGES) {
      return {
        error: `Please upload at least ${MIN_ESCORT_IMAGES} images. The first image will be your profile picture.`,
      };
    }
    if (photoFiles.length > MAX_ESCORT_IMAGES) {
      return {
        error: `You can upload at most ${MAX_ESCORT_IMAGES} images.`,
      };
    }
    for (const file of photoFiles) {
      if (!file.type.startsWith("image/")) {
        return { error: "All files must be images." };
      }
      if (file.size > MAX_PHOTO_BYTES) {
        return { error: "Each image must be smaller than 5MB." };
      }
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

  const uploadedImages: { url: string; publicId: string }[] = [];
  if (isEscort && photoFiles.length > 0) {
    for (const file of photoFiles) {
      const upload = await uploadImage(file, {
        folder: "escort-profiles",
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 85,
        format: "auto",
      });
      if (!upload.success || !upload.image) {
        return {
          error: upload.error ?? "Failed to upload an image. Please try again.",
        };
      }
      uploadedImages.push(upload.image);
    }
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

    if (isEscort && uploadedImages.length > 0) {
      await tx.escortProfile.create({
        data: {
          userId: user.id,
          displayName: parsed.data.name,
          images: uploadedImages as unknown as object,
          status: "pending",
          telegram: DEFAULT_ESCORT_TELEGRAM,
          whatsapp: DEFAULT_ESCORT_WHATSAPP,
        },
      });
    }
  });

  return { success: true };
}
