"use server";

import { z } from "zod";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getEffectivePlanById } from "@/lib/plans";
import { uploadImage } from "@/lib/cloudinary-utils";

export type UpgradeFormState = {
  error?: string;
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const formSchema = z.object({
  planId: z.enum(["Normal", "VIP", "Platinum"]),
  paymentMethod: z.enum(["bank", "mobile_money"]),
  proof: z.custom<File>((value) => value instanceof File),
});

export async function submitUpgradePayment(
  _prevState: UpgradeFormState,
  formData: FormData
): Promise<UpgradeFormState> {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!userId) {
    return { error: "Please sign in to continue." };
  }

  if (role !== "admin") {
    return { error: "Only admins can submit or process plan upgrades." };
  }

  const parsed = formSchema.safeParse({
    planId: formData.get("planId"),
    paymentMethod: formData.get("paymentMethod"),
    proof: formData.get("proof"),
  });

  if (!parsed.success) {
    return { error: "Please select a plan and upload a valid image." };
  }

  const plan = await getEffectivePlanById(parsed.data.planId);
  if (!plan || plan.priceEtb === 0) {
    return { error: "Please select a paid plan to continue." };
  }

  // Prevent duplicate active subscriptions before charging Cloudinary.
  const now = new Date();
  const activeSubscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: "active",
      OR: [
        { endDate: { gte: now } },
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
      planId: plan.id,
    },
  });
  if (pendingSubscription) {
    return { error: "You already have a pending payment request." };
  }

  const proof = parsed.data.proof;
  if (!proof.type.startsWith("image/")) {
    return { error: "Upload a valid image file." };
  }
  if (proof.size > MAX_UPLOAD_BYTES) {
    return { error: "Image must be smaller than 5MB." };
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
      planId: plan.id,
      status: "pending",
      paymentMethod: parsed.data.paymentMethod,
      paymentProofUrl: uploadResult.image.url,
      paymentProofPublicId: uploadResult.image.publicId,
    },
    include: {
      user: true,
    },
  });

  redirect("/dashboard?subscription=pending");
}
