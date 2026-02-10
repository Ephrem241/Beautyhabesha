"use server";

import { z } from "zod";
import bcrypt from "bcrypt";

import { prisma } from "@/lib/db";
import { uploadImage } from "@/lib/cloudinary-utils";
import { DEFAULT_ESCORT_TELEGRAM, DEFAULT_ESCORT_WHATSAPP } from "@/lib/escort-defaults";

const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5MB
const MIN_ESCORT_IMAGES = 3;
const MAX_ESCORT_IMAGES = 12;

const MIN_AGE = 18;

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username: letters, numbers, underscores only"),
  age: z.coerce.number().int().min(MIN_AGE, `You must be at least ${MIN_AGE}`).max(120),
  password: z.string().min(6),
  role: z.enum(["user", "escort"]),
});

export type RegisterResult = {
  error?: string;
  success?: boolean;
};

export async function registerUser(formData: FormData): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse({
    username: formData.get("username"),
    age: formData.get("age"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const parts = Object.values(msg).flat().filter(Boolean) as string[];
    return { error: parts.length ? parts.join(" ") : "Please fill out all fields correctly." };
  }

  const username = parsed.data.username.trim().toLowerCase();

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

  try {
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return { error: "This username is already taken." };
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
          username,
          age: parsed.data.age,
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
            displayName: parsed.data.username,
            images: uploadedImages as unknown as object,
            status: "pending",
            telegram: DEFAULT_ESCORT_TELEGRAM,
            whatsapp: DEFAULT_ESCORT_WHATSAPP,
          },
        });
      }
    });

    return { success: true };
  } catch (err) {
    console.error("[register] Error:", err);
    const msg = err instanceof Error ? err.message : String(err);
    if (/timeout|connection|p1017|econnreset/i.test(msg)) {
      return { error: "Database is temporarily unavailable. Please try again in a moment." };
    }
    return { error: "Something went wrong. Please try again." };
  }
}
