/**
 * In-memory rate limiter for API routes. Use per-IP or per-session.
 * For production at scale, prefer Redis or Vercel KV.
 */

const store = new Map<string, { count: number; resetAt: number }>();

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX = 60;

export type RateLimitOptions = {
  windowMs?: number;
  max?: number;
};

export function rateLimitCheck(
  key: string,
  options: RateLimitOptions = {}
): { ok: true } | { ok: false; retryAfter: number } {
  const { windowMs = DEFAULT_WINDOW_MS, max = DEFAULT_MAX } = options;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (entry.count >= max) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }

  entry.count += 1;
  return { ok: true };
}

/** Get client identifier from request (e.g. x-forwarded-for or x-real-ip). */
export function getRateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0]?.trim() : null;
  const realIp = request.headers.get("x-real-ip");
  return ip ?? realIp ?? "unknown";
}
