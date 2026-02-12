/** Consider a model "online" if lastActiveAt is within this many minutes. */
export const ONLINE_THRESHOLD_MINUTES = 15;

export function isOnline(lastActiveAt: Date | null | undefined): boolean {
  if (!lastActiveAt) return false;
  const cutoff = Date.now() - ONLINE_THRESHOLD_MINUTES * 60 * 1000;
  return lastActiveAt instanceof Date
    ? lastActiveAt.getTime() >= cutoff
    : new Date(lastActiveAt).getTime() >= cutoff;
}
