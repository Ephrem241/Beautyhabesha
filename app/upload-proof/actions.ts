"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSubscriptionPlanBySlug } from "@/lib/subscription-plans";
import { uploadImage } from "@/lib/cloudinary-utils";
import type { PaymentMethod } from "@prisma/client";

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
    redirect(`/auth/login?callbackUrl=${encodeURIComponent("/upload-proof")}`);
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
    return { error: "Upload a valid image file (JPG or PNG)." };
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
    redirect("/upload-proof?plan=" + plan.slug);
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

  redirect("/upload-proof?plan=" + plan.slug);
}
