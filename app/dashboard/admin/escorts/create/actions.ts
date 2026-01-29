"use server";

import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadImage, deleteImages, type CloudinaryImage } from "@/lib/cloudinary-utils";
import { DEFAULT_ESCORT_TELEGRAM, DEFAULT_ESCORT_WHATSAPP } from "@/lib/escort-defaults";

const MIN_IMAGES = 3;
const MAX_IMAGES = 12;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

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

  const photoFiles = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (photoFiles.length < MIN_IMAGES) {
    return { error: `Upload at least ${MIN_IMAGES} images. The first image is the profile picture.` };
  }
  if (photoFiles.length > MAX_IMAGES) {
    return { error: `Upload at most ${MAX_IMAGES} images.` };
  }
  for (const file of photoFiles) {
    if (!file.type.startsWith("image/")) {
      return { error: "All files must be images." };
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return { error: "Each image must be smaller than 5MB." };
    }
  }

  const uploadedImages: CloudinaryImage[] = [];
  for (const file of photoFiles) {
    const result = await uploadImage(file, {
      folder: "escort-profiles",
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 85,
      format: "auto",
    });
    if (!result.success || !result.image) {
      if (uploadedImages.length > 0) {
        const ids = uploadedImages.map((img) => img.publicId);
        await deleteImages(ids).catch(console.error);
      }
      return { error: result.error ?? "Failed to upload an image. Please try again." };
    }
    uploadedImages.push(result.image);
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
        images: uploadedImages as unknown as object,
        status: "approved",
        approvedAt: new Date(),
        approvedBy: adminId,
        telegram: DEFAULT_ESCORT_TELEGRAM,
        whatsapp: DEFAULT_ESCORT_WHATSAPP,
      },
    });
  });

  redirect("/dashboard/admin/escorts?created=1");
}
