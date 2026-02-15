"use server";

import { z } from "zod";
import bcrypt from "bcrypt";
import { redirect } from "next/navigation";

import { randomUUID } from "crypto";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { uploadImage, deleteImages, type CloudinaryImage } from "@/lib/cloudinary-utils";
import {
  DEFAULT_ESCORT_TELEGRAM,
  DEFAULT_ESCORT_WHATSAPP,
  DEFAULT_ESCORT_PASSWORD,
} from "@/lib/escort-defaults";

const MIN_IMAGES = 3;
const MAX_IMAGES = 12;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const createSchema = z.object({
  name: z.string().min(2).max(100),
  displayName: z.string().min(2).max(60).optional(),
  city: z.string().max(60).optional().or(z.literal("")),
  age: z.coerce.number().int().min(18).max(99).optional().nullable(),
  available: z
    .union([z.literal("on"), z.literal(undefined)])
    .transform((v) => v === "on"),
  setAsOnline: z
    .union([z.literal("on"), z.literal(undefined)])
    .transform((v) => v === "on"),
  price: z.coerce.number().int().min(0).optional().nullable(),
  description: z.string().max(2000).optional().or(z.literal("")),
  bio: z.string().max(500).optional().or(z.literal("")),
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
    name: formData.get("name"),
    displayName: formData.get("displayName") || undefined,
    city: formData.get("city") || undefined,
    age: (() => {
    const v = formData.get("age");
    const s = v != null ? String(v).trim() : "";
    return s === "" ? undefined : v;
  })(),
    available: formData.get("available") ?? undefined,
    setAsOnline: formData.get("setAsOnline") ?? undefined,
    price: (() => {
    const v = formData.get("price");
    const s = v != null ? String(v).trim() : "";
    return s === "" ? undefined : v;
  })(),
    description: formData.get("description") || undefined,
    bio: formData.get("bio") || undefined,
  });

  if (!parsed.success) {
    return { error: "Please fill required fields. Name 2–100 chars." };
  }

  const displayName = parsed.data.displayName?.trim() || parsed.data.name.trim();
  const unique = randomUUID().slice(0, 12);
  const username = `escort_${unique}`.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { error: "Generated username already exists. Please try again." };
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

  const hashedPassword = await bcrypt.hash(DEFAULT_ESCORT_PASSWORD, 10);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username,
        name: parsed.data.name,
        age: parsed.data.age ?? null,
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
        bio: parsed.data.bio?.trim() || null,
        city: parsed.data.city?.trim() || null,
        available: parsed.data.available,
        price: parsed.data.price ?? null,
        description: parsed.data.description?.trim() || null,
        lastActiveAt: parsed.data.setAsOnline ? new Date() : null,
        images: uploadedImages as unknown as object,
        status: "approved",
        approvedAt: new Date(),
        approvedBy: adminId,
        telegram: DEFAULT_ESCORT_TELEGRAM,
        whatsapp: DEFAULT_ESCORT_WHATSAPP,
      },
    });
  });

  redirect(`/dashboard/admin/escorts?created=1&username=${encodeURIComponent(username)}`);
}
