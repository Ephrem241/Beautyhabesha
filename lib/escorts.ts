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
  getActiveSubscriptionsForUsers,
  getPlanPriorityMap,
  resolvePlanAccess,
} from "@/lib/subscription-access";
import { getViewerHasActiveSubscription } from "@/lib/viewer-access";
import { prisma } from "@/lib/db";
import { extractImageUrls } from "@/lib/image-helpers";
import { cursorPageResult } from "@/lib/pagination";

export type PublicEscort = {
  id: string;
  displayName: string;
  bio?: string;
  description?: string;
  city?: string;
  images: string[];
  /** Telegram handle (e.g. @feven) - always present when escort has one, for TelegramButton visibility */
  telegram?: string | null;
  contact?: {
    phone?: string;
    telegram?: string;
    whatsapp?: string;
  };
  planId: PlanId;
  planPriority: number;
  canShowContact: boolean;
  createdAt: Date;
  lastActiveAt?: Date | null;
};

/** Returns all images for every escort - blur and carousel apply to Platinum, VIP, and Normal alike. */
function limitImagesForPlan(_planId: PlanId, images: string[]): string[] {
  return images;
}

export async function getPublicEscorts(): Promise<PublicEscort[]> {
  const profiles = await prisma.escortProfile.findMany({
    where: { status: "approved" },
    select: {
      id: true,
      displayName: true,
      bio: true,
      description: true,
      city: true,
      images: true,
      telegram: true,
      phone: true,
      whatsapp: true,
      userId: true,
      createdAt: true,
      lastActiveAt: true,
    },
  });
  const userIds = profiles.map((profile) => profile.userId);
  const activeSubscriptions = await getActiveSubscriptionsForUsers(userIds);
  const { planMap, fallbackMap: _fallbackMap } = await getPlanPriorityMap();

  const escorts = profiles.map((profile) => {
    const planId =
      activeSubscriptions.get(profile.userId)?.planId ?? ("Normal" as PlanId);
    const access = resolvePlanAccess(planId, planMap, _fallbackMap);
    const allImages = extractImageUrls(profile.images);
    const limitedImages = limitImagesForPlan(access.planId, allImages);

    return {
      id: profile.id,
      displayName: profile.displayName,
      bio: profile.bio ?? undefined,
      description: profile.description ?? undefined,
      city: profile.city ?? undefined,
      images: limitedImages,
      telegram: profile.telegram ?? undefined,
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
      lastActiveAt: profile.lastActiveAt ?? undefined,
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

  const { planMap, fallbackMap: _fallbackMap } = await getPlanPriorityMap();

  type WithRanking = PublicEscort & RankedEscortPayload;

  const escorts: WithRanking[] = profiles.map((profile) => {
    const subscription = profile.user.subscriptions[0];
    const planIdFromSub = subscription?.planId;
    const planIdFromUser = profile.user.currentPlan;
    const subscriptionPlanId = normalizePlanId(
      planIdFromSub ?? planIdFromUser ?? "Normal"
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
      description: viewerHasAccess ? (profile.description ?? undefined) : undefined,
      city: profile.city ?? undefined,
      images: limitedImages.length > 0 ? limitedImages : [],
      telegram: profile.telegram ?? undefined,
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
    ({ rankingPriority, completenessScore, displayPlanId, ...rest }) => {
      void rankingPriority;
      void completenessScore;
      void displayPlanId;
      return rest;
    }
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

export type EscortsByPlan = {
  platinum: PublicEscort[];
  vip: PublicEscort[];
  normal: PublicEscort[];
};

export async function getEscortsGroupedByPlan(
  options?: GetEscortsOptions & { limitPerPlan?: number }
): Promise<EscortsByPlan> {
  const limitPerPlan = options?.limitPerPlan ?? 8;
  const escorts = await getPublicEscortsOptimized(options);
  const platinum = escorts.filter((e) => e.planId === "Platinum").slice(0, limitPerPlan);
  const vip = escorts.filter((e) => e.planId === "VIP").slice(0, limitPerPlan);
  const normal = escorts.filter((e) => e.planId === "Normal").slice(0, limitPerPlan);
  return { platinum, vip, normal };
}

/** Search approved profiles by displayName, city, or bio (case-insensitive). Returns up to 50. */
export async function searchProfiles(
  query: string,
  options?: GetEscortsOptions
): Promise<PublicEscort[]> {
  const q = query?.trim();
  if (!q) return getBrowseProfiles(options);
  return getBrowseProfilesFiltered({
    ...options,
    filters: { search: q },
  });
}

/** Fetch profiles for browse/swipe. Approved only, 50 limit, createdAt desc. */
export async function getBrowseProfiles(
  options?: GetEscortsOptions & { filters?: import("@/lib/browse-filters").BrowseFilters }
): Promise<PublicEscort[]> {
  const { countActiveFilters } = await import("@/lib/browse-filters");
  if (options?.filters && countActiveFilters(options.filters) > 0) {
    return getBrowseProfilesFiltered(options as Parameters<typeof getBrowseProfilesFiltered>[0]);
  }
  const escorts = await getPublicEscortsOptimized(options);
  return escorts.slice(0, 50);
}

export async function getBrowseProfilesFiltered(
  options: GetEscortsOptions & { filters: import("@/lib/browse-filters").BrowseFilters }
): Promise<PublicEscort[]> {
  const { buildBrowseWhere } = await import("@/lib/browse-filters");

  const viewerUserId = options.viewerUserId ?? null;
  const viewerHasAccess = await getViewerHasActiveSubscription(viewerUserId);
  const where = buildBrowseWhere(options.filters);

  const now = new Date();
  const graceCutoff = getGraceCutoff(now);
  const profiles = await prisma.escortProfile.findMany({
    where,
    include: {
      user: {
        include: {
          subscriptions: {
            where: {
              status: "active",
              OR: [{ endDate: { gte: graceCutoff } }, { endDate: null }],
            },
            orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
            take: 1,
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const { planMap, fallbackMap: _fallbackMap } = await getPlanPriorityMap();
  type WithRanking = PublicEscort & RankedEscortPayload;

  const escorts: WithRanking[] = profiles.map((profile) => {
    const subscription = profile.user.subscriptions[0];
    const planIdFromSub = subscription?.planId;
    const planIdFromUser = profile.user.currentPlan;
    const subscriptionPlanId = normalizePlanId(
      planIdFromSub ?? planIdFromUser ?? "Normal"
    ) as PlanId;
    const displayPlanId = getDisplayPlanId(
      profile.manualPlanId,
      subscriptionPlanId
    );
    const planPriority =
      PLAN_PRIORITY[displayPlanId] ?? planMap.get(displayPlanId)?.priority ?? 1;
    const canShowContact = displayPlanId !== "Normal";
    const allImages = extractImageUrls(profile.images);
    const limitedImages = limitImagesForPlan(displayPlanId, allImages);
    const rankingPriority = getRankingPriority(
      displayPlanId,
      profile.rankingSuspended,
      profile.rankingBoostUntil
    );
    const completenessScore = computeProfileCompleteness(
      profile.bio,
      profile.city,
      allImages.length
    );

    return {
      id: profile.id,
      displayName: profile.displayName,
      bio: viewerHasAccess ? (profile.bio ?? undefined) : undefined,
      description: viewerHasAccess ? (profile.description ?? undefined) : undefined,
      city: profile.city ?? undefined,
      images: limitedImages.length > 0 ? limitedImages : [],
      telegram: profile.telegram ?? undefined,
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

  return sortByRanking(escorts).map(
    ({
      rankingPriority: _rp,
      completenessScore: _cs,
      displayPlanId: _dp,
      ...rest
    }) => {
      void _rp;
      void _cs;
      void _dp;
      return rest;
    }
  );
}

export type GetBrowseProfilesCursorOptions = GetEscortsOptions & {
  filters?: import("@/lib/browse-filters").BrowseFilters;
  cursor?: string;
  take?: number;
};

export type GetBrowseProfilesCursorResult = {
  items: PublicEscort[];
  nextCursor: string | null;
};

/** Cursor-based browse profiles. Use for "load more" or large lists. Default take 50. */
export async function getBrowseProfilesCursor(
  options?: GetBrowseProfilesCursorOptions
): Promise<GetBrowseProfilesCursorResult> {
  const take = Math.min(options?.take ?? 50, 100);
  const cursor = options?.cursor ?? undefined;
  const { buildBrowseWhere, countActiveFilters } = await import("@/lib/browse-filters");

  const viewerUserId = options?.viewerUserId ?? null;
  const viewerHasAccess = await getViewerHasActiveSubscription(viewerUserId);
  const where =
    options?.filters && countActiveFilters(options.filters) > 0
      ? buildBrowseWhere(options.filters)
      : { status: "approved" as const };

  const now = new Date();
  const graceCutoff = getGraceCutoff(now);
  const rawTake = take + 1;
  const profiles = await prisma.escortProfile.findMany({
    where,
    include: {
      user: {
        include: {
          subscriptions: {
            where: {
              status: "active",
              OR: [{ endDate: { gte: graceCutoff } }, { endDate: null }],
            },
            orderBy: [{ startDate: "desc" }, { createdAt: "desc" }],
            take: 1,
          },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: rawTake,
    cursor: cursor ? { id: cursor } : undefined,
  });

  const { planMap, fallbackMap: _fallbackMap } = await getPlanPriorityMap();
  type WithRanking = PublicEscort & RankedEscortPayload;

  const escorts: WithRanking[] = profiles.map((profile) => {
    const subscription = profile.user.subscriptions[0];
    const planIdFromSub = subscription?.planId;
    const planIdFromUser = profile.user.currentPlan;
    const subscriptionPlanId = normalizePlanId(
      planIdFromSub ?? planIdFromUser ?? "Normal"
    ) as PlanId;
    const displayPlanId = getDisplayPlanId(
      profile.manualPlanId,
      subscriptionPlanId
    );
    const planPriority =
      PLAN_PRIORITY[displayPlanId] ?? planMap.get(displayPlanId)?.priority ?? 1;
    const canShowContact = displayPlanId !== "Normal";
    const allImages = extractImageUrls(profile.images);
    const limitedImages = limitImagesForPlan(displayPlanId, allImages);
    const rankingPriority = getRankingPriority(
      displayPlanId,
      profile.rankingSuspended,
      profile.rankingBoostUntil
    );
    const completenessScore = computeProfileCompleteness(
      profile.bio,
      profile.city,
      allImages.length
    );

    return {
      id: profile.id,
      displayName: profile.displayName,
      bio: viewerHasAccess ? (profile.bio ?? undefined) : undefined,
      description: viewerHasAccess ? (profile.description ?? undefined) : undefined,
      city: profile.city ?? undefined,
      images: limitedImages.length > 0 ? limitedImages : [],
      telegram: profile.telegram ?? undefined,
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
  const stripped = sorted.map(
    ({
      rankingPriority: _rp,
      completenessScore: _cs,
      displayPlanId: _dp,
      ...rest
    }) => {
      void _rp;
      void _cs;
      void _dp;
      return rest;
    }
  );
  return cursorPageResult(stripped, take);
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
  description: string | null;
  image: string | null;
};

/** Minimal escort data for SEO metadata (OG, Twitter). No subscription gating. */
export async function getEscortMetadataForSeo(
  profileId: string
): Promise<EscortMetadataForSeo | null> {
  const profile = await prisma.escortProfile.findUnique({
    where: { id: profileId },
    select: { displayName: true, city: true, bio: true, description: true, images: true, status: true },
  });
  if (!profile || profile.status !== "approved") return null;
  const urls = extractImageUrls(profile.images);
  return {
    displayName: profile.displayName,
    city: profile.city,
    bio: profile.bio,
    description: profile.description,
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
    const viewerUserId = options?.viewerUserId ?? null;
    const viewerHasAccess = await getViewerHasActiveSubscription(viewerUserId);

    const profile = await prisma.escortProfile.findUnique({
      where: { id: profileId },
      include: { user: { select: { currentPlan: true } } },
    });

    if (!profile || profile.status !== "approved") {
      return null;
    }

    const activeSubscriptions = await getActiveSubscriptionsForUsers([
      profile.userId,
    ]);
    const { planMap, fallbackMap } = await getPlanPriorityMap();

    const planIdFromSub = activeSubscriptions.get(profile.userId)?.planId;
    const planIdFromUser = profile.user?.currentPlan;
    const planId = normalizePlanId(
      planIdFromSub ?? planIdFromUser ?? "Normal"
    ) as PlanId;
    const access = resolvePlanAccess(planId, planMap, fallbackMap);
    const allImages = extractImageUrls(profile.images);
    const limitedImages = limitImagesForPlan(access.planId, allImages);

    return {
      id: profile.id,
      displayName: profile.displayName,
      bio: viewerHasAccess ? (profile.bio ?? undefined) : undefined,
      description: viewerHasAccess ? (profile.description ?? undefined) : undefined,
      city: profile.city ?? undefined,
      images: limitedImages.length > 0 ? limitedImages : [],
      telegram: profile.telegram ?? undefined,
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
      lastActiveAt: profile.lastActiveAt ?? undefined,
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
