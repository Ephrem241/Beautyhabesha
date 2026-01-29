/**
 * Grace period after subscription endDate. Escort remains visible during grace.
 * After grace: subscription marked expired, escort hidden.
 */

export const GRACE_PERIOD_MS = 48 * 60 * 60 * 1000; // 48 hours

/**
 * Returns the cutoff date: subscriptions with endDate >= this are still "active" (including grace).
 */
export function getGraceCutoff(now: Date = new Date()): Date {
  return new Date(now.getTime() - GRACE_PERIOD_MS);
}

/**
 * True if endDate is still within grace (or in future). Used for visibility.
 */
export function isWithinGraceOrActive(endDate: Date | null, now: Date = new Date()): boolean {
  if (!endDate) return true;
  return endDate.getTime() >= now.getTime() - GRACE_PERIOD_MS;
}

/**
 * True if subscription should be expired (past grace). Used for cron expiration.
 */
export function isPastGrace(endDate: Date | null, now: Date = new Date()): boolean {
  if (!endDate) return false;
  return endDate.getTime() < now.getTime() - GRACE_PERIOD_MS;
}
