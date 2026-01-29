"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSubscriptionPlanBySlug } from "@/lib/subscription-plans";
import { getGraceCutoff } from "@/lib/subscription-grace";
import { uploadImage } from "@/lib/cloudinary-utils";

export type PaymentFormState = {
  error?: string;
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const formSchema = z.object({
  planSlug: z.string().min(1),
  paymentMethod: z.enum(["bank", "mobile_money"]),
  proof: z.custom<File>((value) => value instanceof File),
});

export async function submitPaymentProof(
  _prevState: PaymentFormState,
  formData: FormData
): Promise<PaymentFormState> {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!userId) {
    return { error: "Please sign in to upload a payment proof." };
  }

  if (role !== "admin") {
    return {
      error: "Only admins can submit or process payment proofs for plan upgrades.",
    };
  }

  const result = formSchema.safeParse({
    planSlug: formData.get("planSlug"),
    paymentMethod: formData.get("paymentMethod"),
    proof: formData.get("proof"),
  });

  if (!result.success) {
    return { error: "Please select a plan and upload a valid image." };
  }

  const plan = await getSubscriptionPlanBySlug(result.data.planSlug);
  if (!plan || !plan.isActive || plan.price === 0) {
    return { error: "Plan not found or not available for purchase." };
  }

  const proof = result.data.proof;
  if (!proof.type.startsWith("image/")) {
    return { error: "Upload a valid image file." };
  }

  if (proof.size > MAX_UPLOAD_BYTES) {
    return { error: "Image must be smaller than 5MB." };
  }

  const graceCutoff = getGraceCutoff(new Date());
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
      OR: [
        { endDate: { gte: graceCutoff } },
        { endDate: null },
      ],
    },
  });
  if (activeSubscription) {
    return { error: "You already have an active subscription." };
  }

  const pendingSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "pending",
      subscriptionPlanId: plan.id,
    },
  });
  if (pendingSubscription) {
    return { error: "You already have a pending payment request." };
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
      error: uploadResult.error || "Failed to upload payment proof. Please try again.",
    };
  }

  await prisma.subscription.create({
    data: {
      userId,
      planId: plan.name,
      subscriptionPlanId: plan.id,
      status: "pending",
      paymentMethod: result.data.paymentMethod,
      paymentProofUrl: uploadResult.image.url,
      paymentProofPublicId: uploadResult.image.publicId,
    },
  });

  redirect("/dashboard?payment=success");
}
