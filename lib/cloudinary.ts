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
 * Upload image with automatic watermark for content protection
 * @param file - File path or data URI
 * @param folder - Cloudinary folder (default: 'escorts')
 * @returns Upload result with secure_url
 */
export async function uploadWithWatermark(
  file: string,
  folder: string = "escorts"
) {
  const result = await cloudinary.uploader.upload(file, {
    folder,
    transformation: [
      // Optimize image size and quality
      { width: 1200, height: 1600, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" }, // WebP/AVIF for modern browsers
      // Add watermark (requires watermark image uploaded to Cloudinary)
      // Upload a watermark image to your Cloudinary account and use its public_id here
      // Example: cloudinary.uploader.upload('watermark.png', { public_id: 'watermark_logo' })
      {
        overlay: "watermark_logo", // Replace with your watermark public_id
        gravity: "south_east",
        opacity: 60,
        width: 200,
      },
    ],
  });

  return result;
}

/**
 * Generate optimized Cloudinary URL with watermark
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
