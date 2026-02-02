import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";
import { getEscortIdsForSitemap } from "@/lib/escorts";

const STATIC: { url: string; lastModified?: Date; changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly"; priority?: number }[] = [
  { url: "", changeFrequency: "daily", priority: 1 },
  { url: "/escorts", changeFrequency: "daily", priority: 0.9 },
  { url: "/browse", changeFrequency: "daily", priority: 0.85 },
  { url: "/pricing", changeFrequency: "weekly", priority: 0.8 },
  { url: "/terms", changeFrequency: "monthly", priority: 0.3 },
  { url: "/privacy", changeFrequency: "monthly", priority: 0.3 },
  { url: "/18-plus", changeFrequency: "yearly", priority: 0.2 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();

  const staticEntries: MetadataRoute.Sitemap = STATIC.map((s) => ({
    url: `${base}${s.url || "/"}`,
    lastModified: s.lastModified ?? new Date(),
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }));

  const ids = await getEscortIdsForSitemap();
  const escortEntries: MetadataRoute.Sitemap = ids.map((id) => ({
    url: `${base}/escorts/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  const profileEntries: MetadataRoute.Sitemap = ids.map((id) => ({
    url: `${base}/profiles/${id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...escortEntries, ...profileEntries];
}
