"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { Prisma } from "@prisma/client";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserPlan } from "@/lib/plan-access";
import {
  uploadImage,
  deleteImages,
  convertLegacyImage,
  type CloudinaryImage,
} from "@/lib/cloudinary-utils";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const profileSchema = z.object({
  displayName: z.string().min(2).max(60),
  bio: z.string().max(500).optional().or(z.literal("")),
  city: z.string().max(60).optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  telegram: z.string().max(40).optional().or(z.literal("")),
  whatsapp: z.string().max(40).optional().or(z.literal("")),
  existingImages: z
    .string()
    .optional()
    .transform((value) => (value ? value : "[]")),
});

type FormState = {
  error?: string;
};

async function requireEscort() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "escort") {
    redirect("/");
  }
  return session.user.id;
}

export async function upsertEscortProfile(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const userId = await requireEscort();

  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio"),
    city: formData.get("city"),
    phone: formData.get("phone"),
    telegram: formData.get("telegram"),
    whatsapp: formData.get("whatsapp"),
    existingImages: formData.get("existingImages"),
  });

  if (!parsed.success) {
    return { error: "Please fill out all required fields." };
  }

  const planAccess = await getUserPlan(userId);
  const imageLimit = planAccess.imageLimit;

  // Parse existing images - handle both legacy string[] and new CloudinaryImage[] format
  const existingImages = (() => {
    try {
      const imageData = JSON.parse(parsed.data.existingImages);
      // If it's an array of strings (legacy format), convert them
      if (Array.isArray(imageData)) {
        if (imageData.length > 0 && typeof imageData[0] === "string") {
          // Legacy format: string[]
          return imageData.map((url: string) => convertLegacyImage(url));
        }
        // New format: CloudinaryImage[]
        return imageData as CloudinaryImage[];
      }
      return [];
    } catch {
      return [];
    }
  })();

  // Get URLs of images to remove
  const removedImageUrls = new Set(
    formData.getAll("removeImages").filter(Boolean) as string[]
  );

  // Separate images to keep and images to delete
  const imagesToDelete: CloudinaryImage[] = [];
  const remainingImages = existingImages.filter((image) => {
    if (removedImageUrls.has(image.url)) {
      imagesToDelete.push(image);
      return false;
    }
    return true;
  });

  const uploads = formData.getAll("images").filter((value) => value instanceof File) as File[];

  const totalImages = remainingImages.length + uploads.length;
  if (imageLimit !== null && totalImages > imageLimit) {
    return {
      error: `You can upload up to ${imageLimit} images on the ${planAccess.planId} plan.`,
    };
  }

  // Validate uploads
  for (const file of uploads) {
    if (!file.type.startsWith("image/")) {
      return { error: "Only image files are allowed." };
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return { error: "Each image must be smaller than 5MB." };
    }
  }

  // Upload new images with optimization and error handling
  const uploadedImages: CloudinaryImage[] = [];
  for (const file of uploads) {
    const uploadResult = await uploadImage(file, {
      folder: "escort-profiles",
      maxWidth: 1920, // Max width for optimization
      maxHeight: 1920, // Max height for optimization
      quality: 85, // Good quality with compression
      format: "auto", // Auto format (WebP when supported)
    });

    if (!uploadResult.success || !uploadResult.image) {
      // If upload fails, try to clean up any already uploaded images
      if (uploadedImages.length > 0) {
        const publicIds = uploadedImages.map((img) => img.publicId);
        await deleteImages(publicIds).catch(console.error);
      }
      return {
        error: uploadResult.error || "Failed to upload image. Please try again.",
      };
    }

    uploadedImages.push(uploadResult.image);
  }

  // Delete removed images from Cloudinary (non-blocking)
  if (imagesToDelete.length > 0) {
    const publicIds = imagesToDelete
      .map((img) => img.publicId)
      .filter((id) => id && !id.startsWith("legacy_")); // Don't try to delete legacy placeholders
    if (publicIds.length > 0) {
      deleteImages(publicIds).catch((error) => {
        console.error("Failed to delete images from Cloudinary:", error);
        // Don't fail the request if cleanup fails
      });
    }
  }

  // Combine remaining and newly uploaded images
  const allImages: CloudinaryImage[] = [...remainingImages, ...uploadedImages];

  // Store images as JSON (array of {url, publicId} objects)
  await prisma.escortProfile.upsert({
    where: { userId },
    update: {
      displayName: parsed.data.displayName,
      bio: parsed.data.bio || null,
      city: parsed.data.city || null,
      images: allImages as Prisma.InputJsonValue,
      phone: parsed.data.phone || null,
      telegram: parsed.data.telegram || null,
      whatsapp: parsed.data.whatsapp || null,
    },
    create: {
      userId,
      displayName: parsed.data.displayName,
      bio: parsed.data.bio || null,
      city: parsed.data.city || null,
      images: allImages as Prisma.InputJsonValue,
      phone: parsed.data.phone || null,
      telegram: parsed.data.telegram || null,
      whatsapp: parsed.data.whatsapp || null,
      status: "pending",
    },
  });

  redirect("/dashboard?profile=updated");
}
