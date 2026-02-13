"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSubscriptionPlanBySlug } from "@/lib/subscription-plans";
import { uploadImage, deleteImage } from "@/lib/cloudinary-utils";
import type { PaymentMethod } from "@prisma/client";
import { rateLimitCheck } from "@/lib/rate-limit";

export type UploadProofState = {
  error?: string;
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const formSchema = z.object({
  planSlug: z.string().min(1),
  planId: z.string().min(1),
  paymentMethod: z.enum(["telebirr", "cbe", "bank"]),
  proof: z.custom<File>((value) => value instanceof File),
});

export async function submitPaymentProof(
  _prevState: UploadProofState,
  formData: FormData
): Promise<UploadProofState> {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  if (!userId) {
    const planSlug = formData.get("planSlug");
    const callbackUrl =
      typeof planSlug === "string" && planSlug
        ? `/upload-proof?plan=${encodeURIComponent(planSlug)}`
        : "/upload-proof";
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  try {
    // Rate limiting: max 5 payment submissions per hour
    const rateLimitResult = rateLimitCheck(`payment-upload:${userId}`, {
      max: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitResult.ok) {
      return {
        error: `Too many payment submissions. Please try again in ${rateLimitResult.retryAfter} seconds.`,
      };
    }

    const result = formSchema.safeParse({
      planSlug: formData.get("planSlug"),
      planId: formData.get("planId"),
      paymentMethod: formData.get("paymentMethod"),
      proof: formData.get("proof"),
    });

    if (!result.success) {
      return { error: "Please select a payment method and upload a valid image." };
    }

    const plan = await getSubscriptionPlanBySlug(result.data.planSlug);
    if (!plan || !plan.isActive || plan.price === 0) {
      return { error: "Plan not found or not available for purchase." };
    }

    if (plan.id !== result.data.planId) {
      return { error: "Plan mismatch. Please refresh and try again." };
    }

    const proof = result.data.proof;
    if (!proof.type.startsWith("image/")) {
      return { error: "Upload a valid image file (JPG, PNG, GIF, or WebP)." };
    }

    if (proof.size > MAX_UPLOAD_BYTES) {
      return { error: "Image must be smaller than 5MB." };
    }

    const existingPending = await prisma.payment.findFirst({
      where: {
        userId,
        planId: plan.id,
        status: "pending",
      },
    });
    if (existingPending) {
      redirect("/dashboard?pending=already_submitted");
    }

    const uploadResult = await uploadImage(proof, {
      folder: "payment-proofs",
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 85,
      format: "auto",
    });

    if (!uploadResult.success || !uploadResult.image) {
      return {
        error: uploadResult.error ?? "Failed to upload. Please try again.",
      };
    }

    let uploadedPublicId: string | null = uploadResult.image.publicId;
    try {
      await prisma.payment.create({
        data: {
          userId,
          planId: plan.id,
          amount: plan.price,
          receiptUrl: uploadResult.image.url,
          paymentMethod: result.data.paymentMethod as PaymentMethod,
          status: "pending",
        },
      });
      uploadedPublicId = null; // Success — no cleanup needed
    } finally {
      if (uploadedPublicId) {
        await deleteImage(uploadedPublicId).catch(console.error);
      }
    }

    redirect("/dashboard?payment=success");
  } catch (err) {
    if (err && typeof err === "object" && "digest" in err && String((err as { digest?: string }).digest).startsWith("NEXT_REDIRECT")) {
      throw err;
    }
    console.error("[submitPaymentProof] Error:", err);
    return { error: "Something went wrong. Please try again." };
  }
}
