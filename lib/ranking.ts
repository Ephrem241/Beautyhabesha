/**
 * Escort ranking logic. Server-only; do not expose to client.
 * Order: Platinum > VIP > Normal (Free). Secondary: lastActive, completeness, shuffle within tier.
 */

import type { PlanId } from "@/lib/plans";

export type PlanPriority = 1 | 2 | 3;
export const PLAN_PRIORITY: Record<PlanId, PlanPriority> = {
  Normal: 1,
  VIP: 2,
  Platinum: 3,
};

export type RankingProfileInput = {
  id: string;
  lastActiveAt: Date | null;
  rankingBoostUntil: Date | null;
  rankingSuspended: boolean;
  manualPlanId: string | null;
  subscriptionPlanId: PlanId | null;
  bio: string | null;
  city: string | null;
  imageCount: number;
  createdAt: Date;
};

export type RankedEscortPayload = {
  id: string;
  /** Effective tier for display (manual or subscription). */
  displayPlanId: PlanId;
  /** Priority used for sorting (includes boost; suspended = Normal). */
  rankingPriority: PlanPriority;
  lastActiveAt: Date | null;
  completenessScore: number;
  createdAt: Date;
};

/**
 * Effective plan for display: manual override or subscription. No boost in display.
 */
export function getDisplayPlanId(
  manualPlanId: string | null,
  subscriptionPlanId: PlanId | null
): PlanId {
  if (manualPlanId && isPlanId(manualPlanId)) return manualPlanId as PlanId;
  return subscriptionPlanId ?? "Normal";
}

/**
 * Effective priority for sorting: suspended = Normal; boost = Platinum; else display plan.
 */
export function getRankingPriority(
  displayPlanId: PlanId,
  rankingSuspended: boolean,
  rankingBoostUntil: Date | null
): PlanPriority {
  if (rankingSuspended) return PLAN_PRIORITY.Normal;
  const now = new Date();
  if (rankingBoostUntil && rankingBoostUntil >= now) return PLAN_PRIORITY.Platinum;
  return PLAN_PRIORITY[displayPlanId] ?? 1;
}

function isPlanId(s: string): s is PlanId {
  return s === "Normal" || s === "VIP" || s === "Platinum";
}

/**
 * Profile completeness 0–100: bio, city, at least one image.
 */
export function computeProfileCompleteness(
  bio: string | null,
  city: string | null,
  imageCount: number
): number {
  let score = 0;
  if (bio?.trim()) score += 40;
  if (city?.trim()) score += 30;
  if (imageCount > 0) score += 30;
  return score;
}

/**
 * Stable shuffle within same tier using id hash. Same tier order is deterministic per request.
 */
function shuffleSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Sort escorts by: ranking priority desc, lastActiveAt desc (nulls last), completeness desc, then stable shuffle within tier.
 */
export function sortByRanking<T extends RankedEscortPayload>(
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    if (a.rankingPriority !== b.rankingPriority) {
      return b.rankingPriority - a.rankingPriority;
    }
    const aActive = a.lastActiveAt?.getTime() ?? 0;
    const bActive = b.lastActiveAt?.getTime() ?? 0;
    if (aActive !== bActive) return bActive - aActive;
    if (a.completenessScore !== b.completenessScore) {
      return b.completenessScore - a.completenessScore;
    }
    return shuffleSeed(a.id) - shuffleSeed(b.id);
  });
}
