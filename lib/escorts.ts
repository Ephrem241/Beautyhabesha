import { type PlanId } from "@/lib/plans";
import {
  expireStaleSubscriptions,
  getActiveSubscriptionsForUsers,
  getPlanPriorityMap,
  resolvePlanAccess,
} from "@/lib/subscription-access";
import { prisma } from "@/lib/db";
import { extractImageUrls } from "@/lib/image-helpers";

export type PublicEscort = {
  id: string;
  displayName: string;
  bio?: string;
  city?: string;
  images: string[];
  contact?: {
    phone?: string;
    telegram?: string;
    whatsapp?: string;
  };
  planId: PlanId;
  planPriority: number;
  canShowContact: boolean;
  createdAt: Date;
};

function limitImagesForPlan(planId: PlanId, images: string[]): string[] {
  if (images.length === 0) return images;
  if (planId === "Normal") return images.slice(0, 3);
  if (planId === "VIP") return images.slice(0, 10);
  // Platinum (and any other paid tier) can show all images
  return images;
}

export async function getPublicEscorts(): Promise<PublicEscort[]> {
  await expireStaleSubscriptions();

  const profiles = await prisma.escortProfile.findMany({
    where: { status: 'approved' },
  });
  const userIds = profiles.map((profile) => profile.userId);
  const activeSubscriptions = await getActiveSubscriptionsForUsers(userIds);
  const { planMap, fallbackMap } = await getPlanPriorityMap();

  const escorts = profiles.map((profile) => {
    const planId =
      activeSubscriptions.get(profile.userId)?.planId ?? ("Normal" as PlanId);
    const access = resolvePlanAccess(planId, planMap, fallbackMap);
    const allImages = extractImageUrls(profile.images);
    const limitedImages = limitImagesForPlan(access.planId, allImages);

    return {
      id: profile.id,
      displayName: profile.displayName,
      bio: profile.bio ?? undefined,
      city: profile.city ?? undefined,
      images: limitedImages,
      contact: access.canShowContact
        ? {
            phone: profile.phone ?? undefined,
            telegram: profile.telegram ?? undefined,
            whatsapp: profile.whatsapp ?? undefined,
          }
        : undefined,
      planId: access.planId,
      planPriority: access.priority,
      canShowContact: access.canShowContact,
      createdAt: profile.createdAt,
    };
  });

  return escorts.sort((a, b) => {
    if (b.planPriority !== a.planPriority) {
      return b.planPriority - a.planPriority;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export async function getPublicEscortsOptimized(): Promise<PublicEscort[]> {
  await expireStaleSubscriptions();

  const now = new Date();
  const profiles = await prisma.escortProfile.findMany({
    where: { status: 'approved' },
    include: {
      user: {
        include: {
          subscriptions: {
            where: {
              status: "active",
              OR: [
                { endDate: { gte: now } },
                { endDate: null },
              ],
            },
            orderBy: [
              { startDate: "desc" },
              { createdAt: "desc" },
            ],
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const { planMap, fallbackMap } = await getPlanPriorityMap();

  const escorts = profiles.map((profile) => {
    const subscription = profile.user.subscriptions[0];
    const planId = normalizePlanId(subscription?.planId ?? "Normal");
    const planData = planMap.get(planId) ?? fallbackMap.get(planId);
    const planPriority = planData?.priority ?? (planId === "Platinum" ? 3 : planId === "VIP" ? 2 : 1);
    const canShowContact = planId !== "Normal";
    const allImages = extractImageUrls(profile.images);
    const limitedImages = limitImagesForPlan(planId, allImages);

    return {
      id: profile.id,
      displayName: profile.displayName,
      bio: profile.bio ?? undefined,
      city: profile.city ?? undefined,
      images: limitedImages,
      contact: canShowContact
        ? {
            phone: profile.phone ?? undefined,
            telegram: profile.telegram ?? undefined,
            whatsapp: profile.whatsapp ?? undefined,
          }
        : undefined,
      planId: planId as PlanId,
      planPriority,
      canShowContact,
      createdAt: profile.createdAt,
    };
  });

  return escorts.sort((a, b) => {
    if (b.planPriority !== a.planPriority) {
      return b.planPriority - a.planPriority;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

function normalizePlanId(planId: string): PlanId {
  if (planId === "Normal" || planId === "VIP" || planId === "Platinum") {
    return planId;
  }
  return "Normal";
}

export async function getFeaturedEscorts(limit = 6): Promise<PublicEscort[]> {
  const escorts = await getPublicEscortsOptimized();
  return escorts.filter((escort) => escort.planId === "Platinum").slice(0, limit);
}

export async function getPublicEscortById(
  profileId: string
): Promise<PublicEscort | null> {
  try {
    await expireStaleSubscriptions();

    const profile = await prisma.escortProfile.findUnique({
      where: { id: profileId },
    });
    
    if (!profile || profile.status !== 'approved') {
      return null;
    }

  const activeSubscriptions = await getActiveSubscriptionsForUsers([
    profile.userId,
  ]);
  const { planMap, fallbackMap } = await getPlanPriorityMap();

  const planId =
    activeSubscriptions.get(profile.userId)?.planId ?? ("Normal" as PlanId);
  const access = resolvePlanAccess(planId, planMap, fallbackMap);
  const allImages = extractImageUrls(profile.images);
  const limitedImages = limitImagesForPlan(access.planId, allImages);

  return {
    id: profile.id,
    displayName: profile.displayName,
    bio: profile.bio ?? undefined,
    city: profile.city ?? undefined,
    images: limitedImages,
    contact: access.canShowContact
      ? {
          phone: profile.phone ?? undefined,
          telegram: profile.telegram ?? undefined,
          whatsapp: profile.whatsapp ?? undefined,
        }
      : undefined,
    planId: access.planId,
    planPriority: access.priority,
    canShowContact: access.canShowContact,
    createdAt: profile.createdAt,
  };
  } catch (error) {
    console.error("Error fetching escort profile:", error);
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    return null;
  }
}
