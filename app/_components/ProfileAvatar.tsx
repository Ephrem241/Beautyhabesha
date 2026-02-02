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
  className?: string;
};

export function ProfileAvatar({
  src,
  alt,
  size = 40,
  fallback,
  className = "",
}: ProfileAvatarProps) {
  const initial = (fallback ?? alt.slice(0, 1)).toUpperCase() || "?";

  if (src) {
    return (
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
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-zinc-700 text-sm font-semibold text-zinc-200 ${className}`}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
      aria-hidden
    >
      {initial}
    </span>
  );
}
