import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/auth/",
          "/dashboard/",
          "/escort/",
          "/admin/",
          "/consent",
          "/upgrade",
          "/payment-instructions/",
          "/booking/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
