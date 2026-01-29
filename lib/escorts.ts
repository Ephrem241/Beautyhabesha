import { type PlanId } from "@/lib/plans";
import {
  getDisplayPlanId,
  getRankingPriority,
  computeProfileCompleteness,
  sortByRanking,
  PLAN_PRIORITY,
  type RankedEscortPayload,
} from "@/lib/ranking";
import { getGraceCutoff } from "@/lib/subscription-grace";
import {
  expireStaleSubscriptions,
  getActiveSubscriptionsForUsers,
  getPlanPriorityMap,
  resolvePlanAccess,
} from "@/lib/subscription-access";
import { getViewerHasActiveSubscription } from "@/lib/viewer-access";
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

export type GetEscortsOptions = {
  /** When provided, escort data is limited (no bio, contact, images) if viewer has no active subscription. */
  viewerUserId?: string | null;
};

export async function getPublicEscortsOptimized(
  options?: GetEscortsOptions
): Promise<PublicEscort[]> {
  await expireStaleSubscriptions();

  const viewerUserId = options?.viewerUserId ?? null;
  const viewerHasAccess = await getViewerHasActiveSubscription(viewerUserId);

  const now = new Date();
  const graceCutoff = getGraceCutoff(now);
  const profiles = await prisma.escortProfile.findMany({
    where: { status: 'approved' },
    include: {
      user: {
        include: {
          subscriptions: {
            where: {
              status: "active",
              OR: [
                { endDate: { gte: graceCutoff } },
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

  type WithRanking = PublicEscort & RankedEscortPayload;

  const escorts: WithRanking[] = profiles.map((profile) => {
    const subscription = profile.user.subscriptions[0];
    const subscriptionPlanId = normalizePlanId(
      subscription?.planId ?? "Normal"
    ) as PlanId;
    const displayPlanId = getDisplayPlanId(
      profile.manualPlanId,
      subscriptionPlanId
    );
    const rankingPriority = getRankingPriority(
      displayPlanId,
      profile.rankingSuspended,
      profile.rankingBoostUntil
    );
    const planPriority =
      PLAN_PRIORITY[displayPlanId] ?? (planMap.get(displayPlanId)?.priority ?? 1);
    const canShowContact = displayPlanId !== "Normal";
    const allImages = extractImageUrls(profile.images);
    const limitedImages = limitImagesForPlan(displayPlanId, allImages);
    const completenessScore = computeProfileCompleteness(
      profile.bio,
      profile.city,
      allImages.length
    );

    return {
      id: profile.id,
      displayName: profile.displayName,
      bio: viewerHasAccess ? (profile.bio ?? undefined) : undefined,
      city: profile.city ?? undefined,
      images: viewerHasAccess ? limitedImages : [],
      contact:
        viewerHasAccess && canShowContact
          ? {
              phone: profile.phone ?? undefined,
              telegram: profile.telegram ?? undefined,
              whatsapp: profile.whatsapp ?? undefined,
            }
          : undefined,
      planId: displayPlanId,
      planPriority,
      canShowContact,
      createdAt: profile.createdAt,
      displayPlanId,
      rankingPriority,
      lastActiveAt: profile.lastActiveAt,
      completenessScore,
    };
  });

  const sorted = sortByRanking(escorts);
  return sorted.map(
    ({
      rankingPriority: _rp,
      lastActiveAt: _la,
      completenessScore: _cs,
      displayPlanId: _dp,
      ...rest
    }) => rest
  );
}

function normalizePlanId(planId: string): PlanId {
  if (planId === "Normal" || planId === "VIP" || planId === "Platinum") {
    return planId;
  }
  return "Normal";
}

export async function getFeaturedEscorts(
  limit = 6,
  options?: GetEscortsOptions
): Promise<PublicEscort[]> {
  const escorts = await getPublicEscortsOptimized(options);
  return escorts.filter((escort) => escort.planId === "Platinum").slice(0, limit);
}

/** Lightweight fetch of approved escort IDs for sitemap. */
export async function getEscortIdsForSitemap(): Promise<string[]> {
  const rows = await prisma.escortProfile.findMany({
    where: { status: "approved" },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

export type EscortMetadataForSeo = {
  displayName: string;
  city: string | null;
  bio: string | null;
  image: string | null;
};

/** Minimal escort data for SEO metadata (OG, Twitter). No subscription gating. */
export async function getEscortMetadataForSeo(
  profileId: string
): Promise<EscortMetadataForSeo | null> {
  const profile = await prisma.escortProfile.findUnique({
    where: { id: profileId },
    select: { displayName: true, city: true, bio: true, images: true, status: true },
  });
  if (!profile || profile.status !== "approved") return null;
  const urls = extractImageUrls(profile.images);
  return {
    displayName: profile.displayName,
    city: profile.city,
    bio: profile.bio,
    image: urls[0] ?? null,
  };
}

export type GetEscortByIdOptions = {
  viewerUserId?: string | null;
};

export async function getPublicEscortById(
  profileId: string,
  options?: GetEscortByIdOptions
): Promise<PublicEscort | null> {
  try {
    await expireStaleSubscriptions();

    const viewerUserId = options?.viewerUserId ?? null;
    const viewerHasAccess = await getViewerHasActiveSubscription(viewerUserId);

    const profile = await prisma.escortProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile || profile.status !== "approved") {
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
      bio: viewerHasAccess ? (profile.bio ?? undefined) : undefined,
      city: profile.city ?? undefined,
      images: viewerHasAccess ? limitedImages : [],
      contact:
        viewerHasAccess && access.canShowContact
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
