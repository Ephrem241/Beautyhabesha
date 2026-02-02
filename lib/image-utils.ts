import { type CloudinaryImage } from "./cloudinary-utils";

/** Low-res base64 placeholder for next/image placeholder="blur" to avoid CLS. */
export const BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z";

/**
 * Normalizes image data from Prisma Json field to string[] (URLs only)
 * Handles both legacy string[] format and new CloudinaryImage[] format
 */
export function normalizeImages(images: unknown): string[] {
  if (!images) return [];
  
  // If it's already a string array (legacy format)
  if (Array.isArray(images)) {
    if (images.length === 0) return [];
    
    // Check if first element is a string (legacy format)
    if (typeof images[0] === "string") {
      return images as string[];
    }
    
    // Check if first element is an object with url property (new format)
    if (typeof images[0] === "object" && images[0] !== null && "url" in images[0]) {
      return (images as CloudinaryImage[]).map((img) => img.url);
    }
  }
  
  return [];
}

/**
 * Normalizes image data to CloudinaryImage[] format
 * Converts legacy string[] to CloudinaryImage[] with extracted publicIds
 */
export function normalizeImagesToCloudinaryFormat(images: unknown): CloudinaryImage[] {
  if (!images) return [];
  
  if (Array.isArray(images)) {
    if (images.length === 0) return [];
    
    // Legacy format: string[]
    if (typeof images[0] === "string") {
      return (images as string[]).map((url) => ({
        url,
        publicId: extractPublicIdFromUrl(url) || `legacy_${url.split("/").pop()?.split(".")[0] || "unknown"}`,
      }));
    }
    
    // New format: CloudinaryImage[]
    if (typeof images[0] === "object" && images[0] !== null && "url" in images[0]) {
      return images as CloudinaryImage[];
    }
  }
  
  return [];
}

/**
 * Extracts public_id from a Cloudinary URL
 */
function extractPublicIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    if (match && match[1]) {
      return match[1].replace(/^[^/]+\//, "");
    }
    return null;
  } catch {
    return null;
  }
}
