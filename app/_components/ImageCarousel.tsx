"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CarouselDots } from "./CarouselDots";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";

type ImageCarouselProps = {
  images: string[];
  altPrefix: string;
  autoPlayInterval?: number;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
};

export function ImageCarousel({
  images,
  altPrefix,
  autoPlayInterval = 3000,
  priority = false,
  className = "",
  imageClassName = "",
}: ImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setActiveIndex(0));
  }, [images.length]);

  const goTo = useCallback(
    (delta: number) => {
      if (images.length <= 1) return;
      setActiveIndex((i) => {
        const next = i + delta;
        if (next < 0) return images.length - 1;
        if (next >= images.length) return 0;
        return next;
      });
    },
    [images.length]
  );

  const goToIndex = useCallback((index: number) => {
    setActiveIndex((i) => (index >= 0 && index < images.length ? index : i));
  }, [images.length]);

  useEffect(() => {
    if (images.length <= 1 || isPaused || autoPlayInterval <= 0) return;
    const id = setInterval(
      () => setActiveIndex((i) => (i + 1) % images.length),
      autoPlayInterval
    );
    return () => clearInterval(id);
  }, [images.length, isPaused, autoPlayInterval]);

  const mainImage = images[activeIndex] ?? images[0] ?? null;

  if (images.length === 0 || !mainImage) {
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

        {images.length > 1 && (
          <>
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(-1);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute left-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:opacity-30"
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
            </motion.button>
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goTo(1);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="absolute right-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 disabled:opacity-30"
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
            </motion.button>
            <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2">
              <CarouselDots
                count={images.length}
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
