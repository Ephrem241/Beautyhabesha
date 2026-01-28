import { convertLegacyImage, type CloudinaryImage } from "./cloudinary-utils";

/**
 * Extracts URL from an image, whether it's a string (legacy) or CloudinaryImage object
 */
export function getImageUrl(image: string | CloudinaryImage): string {
  if (typeof image === "string") {
    return image;
  }
  return image.url;
}

/**
 * Converts images array to string array of URLs
 * Handles both legacy string[] and new CloudinaryImage[] formats
 */
export function extractImageUrls(
  images: unknown
): string[] {
  if (!Array.isArray(images)) {
    return [];
  }

  if (images.length === 0) {
    return [];
  }

  // Check if it's an array of strings (legacy format)
  if (typeof images[0] === "string") {
    return images as string[];
  }

  // Check if it's an array of CloudinaryImage objects
  if (
    typeof images[0] === "object" &&
    images[0] !== null &&
    "url" in images[0]
  ) {
    return (images as CloudinaryImage[]).map((img) => img.url);
  }

  // Fallback: try to extract URLs from unknown format
  return images
    .map((img) => {
      if (typeof img === "string") return img;
      if (typeof img === "object" && img !== null && "url" in img) {
        return (img as { url: string }).url;
      }
      return null;
    })
    .filter((url): url is string => url !== null);
}

/**
 * Parses images from Prisma Json field
 * Returns array of CloudinaryImage objects (or converts legacy strings)
 */
export function parseImages(images: unknown): CloudinaryImage[] {
  if (!Array.isArray(images)) {
    return [];
  }

  if (images.length === 0) {
    return [];
  }

  // If it's an array of strings (legacy format), convert them
  if (typeof images[0] === "string") {
    return (images as string[]).map((url) => convertLegacyImage(url));
  }

  // If it's already CloudinaryImage format, return as-is
  if (
    typeof images[0] === "object" &&
    images[0] !== null &&
    "url" in images[0] &&
    "publicId" in images[0]
  ) {
    return images as CloudinaryImage[];
  }

  return [];
}
