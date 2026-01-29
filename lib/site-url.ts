/**
 * Base URL for the site. Used for canonical URLs, sitemap, OpenGraph, etc.
 * Prefer NEXTAUTH_URL or SITE_URL; fallback to VERCEL_URL or localhost.
 */
export function getSiteUrl(): string {
  const u =
    process.env.SITE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null);
  if (u) return u.replace(/\/$/, "");
  return "http://localhost:3000";
}
