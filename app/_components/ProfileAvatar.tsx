"use client";

import Image from "next/image";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";

type ProfileAvatarProps = {
  src?: string | null;
  alt: string;
  /** Size in pixels. Default 40. */
  size?: number;
  /** Fallback when no src: first letter of alt or this value. */
  fallback?: string;
  /** Show vibrant green border ring (model listing style). */
  greenRing?: boolean;
  className?: string;
};

export function ProfileAvatar({
  src,
  alt,
  size = 40,
  fallback,
  greenRing = false,
  className = "",
}: ProfileAvatarProps) {
  const initial = (fallback ?? alt.slice(0, 1)).toUpperCase() || "?";

  const ringClass =
    "ring-2 ring-emerald-400 ring-offset-2 ring-offset-black shrink-0 overflow-hidden rounded-full";

  if (src) {
    const img = (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        sizes={`${size}px`}
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size, minWidth: size, minHeight: size }}
      />
    );
    if (greenRing) {
      return <span className={ringClass}>{img}</span>;
    }
    return img;
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-700 text-sm font-semibold text-zinc-200 ${greenRing ? ringClass : ""} ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      aria-hidden
    >
      {initial}
    </span>
  );
}
