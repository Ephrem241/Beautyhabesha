/**
 * Cursor-based pagination helpers.
 * Use cursor + take instead of skip/take for stable performance on large tables.
 */

export type CursorPageResult<T extends { id: string }> = {
  items: T[];
  nextCursor: string | null;
};

/**
 * Given a raw result array from a Prisma findMany with take: take + 1,
 * returns { items, nextCursor }. nextCursor is the id of the last item returned
 * when there is a next page, so the client can request the next page with cursor=nextCursor.
 */
export function cursorPageResult<T extends { id: string }>(
  rows: T[],
  take: number
): CursorPageResult<T> {
  const hasMore = rows.length > take;
  const items = hasMore ? rows.slice(0, take) : rows;
  const nextCursor = hasMore && items.length > 0 ? items[items.length - 1]!.id : null;
  return { items, nextCursor };
}

export type CursorOrder = { id: "asc" } | { id: "desc" } | { createdAt: "asc" } | { createdAt: "desc" };
