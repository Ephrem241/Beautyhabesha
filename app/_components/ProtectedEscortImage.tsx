"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback } from "react";
import { getEscortImageUrl } from "@/lib/image-watermark";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";

export type ProtectedEscortImageProps = Omit<ImageProps, "src"> & {
  src: string;
  /** When true, full-quality image (no watermark). When false, watermark overlay applied. */
  allowFullQuality: boolean;
  /** Escort display name for watermark text. */
  displayName?: string;
  /** Escort ID for watermark fallback. */
  escortId?: string;
  /** Show subtle "Protected" warning overlay. Default true when allowFullQuality is false. */
  showWarningOverlay?: boolean;
};

/**
 * Renders escort image with optional Cloudinary watermark and anti-save UX.
 * - Watermark only for non-subscribers / preview (allowFullQuality = false).
 * - Prevents right-click save and dragging.
 * - Optional subtle warning overlay.
 */
export function ProtectedEscortImage({
  src,
  allowFullQuality,
  displayName,
  escortId,
  showWarningOverlay = true,
  onContextMenu,
  className = "",
  ...rest
}: ProtectedEscortImageProps) {
  const finalSrc =
    allowFullQuality || !src
      ? src
      : getEscortImageUrl(src, {
          addWatermark: true,
          displayName,
          escortId,
        });

  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      onContextMenu?.(e as React.MouseEvent<HTMLImageElement>);
    },
    [onContextMenu]
  );

  const showWarning = showWarningOverlay && !allowFullQuality && src;

  const { placeholder = "blur", blurDataURL = BLUR_PLACEHOLDER, alt = "", ...imageRest } = rest;

  return (
    <span
      className="relative block select-none overflow-hidden [&_img]:pointer-events-none [&_img]:select-none [&_img]:drag-none"
      onContextMenu={handleContextMenu}
      role="presentation"
    >
      <Image
        src={finalSrc}
        onDragStart={(e) => e.preventDefault()}
        className={className}
        unoptimized={false}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        alt={alt}
        {...imageRest}
      />
      {showWarning ? (
        <span
          className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 rounded bg-black/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/80"
          aria-hidden
        >
          Protected
        </span>
      ) : null}
    </span>
  );
}
