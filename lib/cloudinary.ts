import { v2 as cloudinary } from "cloudinary";

import { env } from "@/lib/env";

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;

/**
 * Generate optimized Cloudinary URL
 * @param publicId - Cloudinary public ID
 * @param width - Desired width
 * @param quality - Image quality (default: 75)
 * @returns Optimized URL
 */
export function getOptimizedUrl(
  publicId: string,
  width: number = 400,
  quality: number = 75
): string {
  return `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},q_${quality},f_auto/${publicId}`;
}
