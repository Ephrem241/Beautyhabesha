"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CarouselDots } from "./CarouselDots";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";
import { getEscortImageUrl } from "@/lib/image-watermark";

type ProfileSliderProps = {
  images: string[];
  altPrefix: string;
  autoPlayInterval?: number;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  /** When true, full-quality images (no watermark). When false, watermark applied. Default true for backward compatibility. */
  allowFullQuality?: boolean;
  /** Escort display name for watermark text. */
  displayName?: string;
  /** Escort ID for watermark fallback. */
  escortId?: string;
};

export function ProfileSlider({
  images,
  altPrefix,
  autoPlayInterval = 3000,
  priority = false,
  className = "",
  imageClassName = "",
  allowFullQuality = true,
  displayName,
  escortId,
}: ProfileSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Process images with watermark if needed (memoized to avoid recalculation)
  const processedImages = useMemo(() => {
    if (allowFullQuality) {
      return images;
    }
    return images.map((img) =>
      getEscortImageUrl(img, {
        addWatermark: true,
        displayName,
        escortId,
      })
    );
  }, [images, allowFullQuality, displayName, escortId]);

  useEffect(() => {
    queueMicrotask(() => setActiveIndex(0));
  }, [processedImages.length]);

  const goTo = useCallback(
    (delta: number) => {
      if (processedImages.length <= 1) return;
      setActiveIndex((i) => {
        const next = i + delta;
        if (next < 0) return processedImages.length - 1;
        if (next >= processedImages.length) return 0;
        return next;
      });
    },
    [processedImages.length]
  );

  const goToIndex = useCallback((index: number) => {
    setActiveIndex((i) => (index >= 0 && index < processedImages.length ? index : i));
  }, [processedImages.length]);

  useEffect(() => {
    if (processedImages.length <= 1 || isPaused || autoPlayInterval <= 0) return;
    const id = setInterval(
      () =>
        setActiveIndex((i) => (i + 1) % processedImages.length),
      autoPlayInterval
    );
    return () => clearInterval(id);
  }, [processedImages.length, isPaused, autoPlayInterval]);

  const mainImage = processedImages[activeIndex] ?? processedImages[0] ?? null;

  if (processedImages.length === 0 || !mainImage) {
    return (
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden rounded-2xl bg-zinc-800 ${className}`.trim()}
      >
        <span className="text-sm uppercase tracking-widest text-zinc-500">
          No image
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-2xl ${className}`.trim()}
      onPointerEnter={() => setIsPaused(true)}
      onPointerLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="relative h-full w-full">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={mainImage}
              alt={`${altPrefix} - ${activeIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className={`object-cover ${imageClassName}`.trim()}
              priority={priority && activeIndex === 0}
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

        {processedImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(-1);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:opacity-30"
              aria-label="Previous image"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(1);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="absolute right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:opacity-30"
              aria-label="Next image"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <div className="absolute bottom-2 left-1/2 z-30">
              <CarouselDots
                count={processedImages.length}
                activeIndex={activeIndex}
                onSelect={goToIndex}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
