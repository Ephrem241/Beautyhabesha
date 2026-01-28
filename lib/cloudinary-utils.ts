import "server-only";

import cloudinary from "@/lib/cloudinary";

export type CloudinaryImage = {
  url: string;
  publicId: string;
};

export type UploadOptions = {
  folder: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "auto" | "jpg" | "png" | "webp";
};

export type UploadResult = {
  success: boolean;
  image?: CloudinaryImage;
  error?: string;
};

/**
 * Uploads an image to Cloudinary with optimization and error handling
 */
export async function uploadImage(
  file: File,
  options: UploadOptions
): Promise<UploadResult> {
  try {
    // Validate file
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "File must be an image",
      };
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Prepare upload options with transformations
    const uploadOptions: Record<string, unknown> = {
      folder: options.folder,
      resource_type: "image",
    };

    // Build transformation array
    const transformations: Record<string, unknown> = {};
    
    // Add resizing if specified
    if (options.maxWidth) {
      transformations.width = options.maxWidth;
    }
    if (options.maxHeight) {
      transformations.height = options.maxHeight;
    }
    if (options.maxWidth || options.maxHeight) {
      transformations.crop = "limit"; // Maintain aspect ratio, don't crop
    }
    
    // Add quality and format to transformation
    if (options.quality) {
      transformations.quality = options.quality;
    }
    if (options.format) {
      transformations.format = options.format;
    }

    // Apply transformations if any
    if (Object.keys(transformations).length > 0) {
      uploadOptions.transformation = [transformations];
    } else {
      // If no transformations, apply quality/format at top level
      if (options.quality) {
        uploadOptions.quality = options.quality;
      }
      if (options.format) {
        uploadOptions.format = options.format;
      }
    }

    // Upload to Cloudinary
    const upload = await cloudinary.uploader.upload(dataUri, uploadOptions);

    // Validate response
    if (!upload.secure_url || !upload.public_id) {
      return {
        success: false,
        error: "Invalid response from Cloudinary",
      };
    }

    return {
      success: true,
      image: {
        url: upload.secure_url,
        publicId: upload.public_id,
      },
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to upload image to Cloudinary",
    };
  }
}

/**
 * Deletes an image from Cloudinary by public_id
 */
export async function deleteImage(
  publicId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!publicId) {
      return { success: false, error: "Public ID is required" };
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok" || result.result === "not found") {
      return { success: true };
    }

    return {
      success: false,
      error: `Failed to delete image: ${result.result}`,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to delete image from Cloudinary",
    };
  }
}

/**
 * Deletes multiple images from Cloudinary
 */
export async function deleteImages(
  publicIds: string[]
): Promise<{ success: boolean; deleted: number; errors: string[] }> {
  const results = await Promise.all(
    publicIds.map((publicId) => deleteImage(publicId))
  );

  const deleted = results.filter((r) => r.success).length;
  const errors = results
    .filter((r) => !r.success)
    .map((r) => r.error || "Unknown error");

  return {
    success: deleted === publicIds.length,
    deleted,
    errors,
  };
}

/**
 * Extracts public_id from a Cloudinary URL
 * Returns null if the URL is not a valid Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  try {
    // Cloudinary URLs have format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}.{ext}
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    if (match && match[1]) {
      // Remove folder prefix if present
      return match[1].replace(/^[^/]+\//, "");
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Converts legacy string URLs to CloudinaryImage format
 * Attempts to extract public_id from URL, or generates a placeholder
 */
export function convertLegacyImage(url: string): CloudinaryImage {
  const publicId = extractPublicIdFromUrl(url);
  return {
    url,
    publicId: publicId || `legacy_${url.split("/").pop()?.split(".")[0] || "unknown"}`,
  };
}
