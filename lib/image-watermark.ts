/**
 * Image watermarking via Cloudinary URL transformations.
 * Apply watermark only for non-subscribers / preview; full-quality for active subscriptions.
 * No separate watermarked images are stored — overlay is applied at delivery.
 */

const DEFAULT_SITE_NAME = "Beautyhabesha";

export type EscortImageUrlOptions = {
  /** When true, appends Cloudinary overlay (watermark). Use for non-subscribers / preview. */
  addWatermark: boolean;
  /** Escort display name (or ID) for watermark text. */
  displayName?: string;
  /** Escort ID for watermark (fallback if displayName not set). */
  escortId?: string;
  /** Site/brand name in watermark. Default "Beautyhabesha". */
  siteName?: string;
};

/**
 * Returns the image URL with optional Cloudinary watermark overlay.
 * Only Cloudinary URLs (res.cloudinary.com) are transformed; others are returned unchanged.
 * Watermark: semi-transparent text, bottom-right + diagonal (center) for visibility.
 */
export function getEscortImageUrl(
  imageUrl: string,
  options: EscortImageUrlOptions
): string {
  const { addWatermark, displayName, escortId, siteName = DEFAULT_SITE_NAME } = options;

  if (!addWatermark || !imageUrl || typeof imageUrl !== "string") {
    return imageUrl;
  }

  if (!imageUrl.includes("res.cloudinary.com")) {
    return imageUrl;
  }

  const uploadIndex = imageUrl.indexOf("/upload/");
  if (uploadIndex === -1) return imageUrl;

  const base = imageUrl.slice(0, uploadIndex + "/upload".length);
  const path = imageUrl.slice(uploadIndex + "/upload/".length).replace(/^\/+/, "");

  if (!path) return imageUrl;

  const watermarkText = [siteName, displayName || escortId || "Profile"].filter(Boolean).join(" | ");
  const encoded = encodeURIComponent(watermarkText);

  // Cloudinary text overlay: l_text:font_size:content, style, then fl_layer_apply with position
  // Semi-transparent (o_50), white text, bottom-right (g_south_east)
  const fontSize = 42;
  const opacity = 50;
  const textLayer = `l_text:Arial_${fontSize}_bold:${encoded},co_white,g_south_east,x_24,y_24,o_${opacity}`;
  const applyLayer = "fl_layer_apply,g_south_east,x_24,y_24";

  const transformation = `${textLayer}/${applyLayer}`;
  return `${base}/${transformation}/${path}`;
}

/**
 * Check if a URL is a Cloudinary delivery URL (can have watermark applied).
 */
export function isCloudinaryUrl(url: string): boolean {
  return typeof url === "string" && url.includes("res.cloudinary.com");
}
