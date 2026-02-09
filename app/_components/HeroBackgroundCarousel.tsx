"use client";

import { useCallback, useEffect, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";

const AUTO_PLAY_MS = 5000;
const BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z";

type HeroBackgroundCarouselProps = {
  imageUrls: string[];
  /** Auto-advance interval in ms. Default 5000. */
  intervalMs?: number;
};

export function HeroBackgroundCarousel({
  imageUrls,
  intervalMs = AUTO_PLAY_MS,
}: HeroBackgroundCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    duration: 30,
    skipSnaps: false,
    watchDrag: false,
  });

  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startAutoPlay = useCallback(() => {
    if (!emblaApi || imageUrls.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, intervalMs);
  }, [emblaApi, imageUrls.length, intervalMs]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!emblaApi || imageUrls.length <= 1) return;
    startAutoPlay();
    return () => stopAutoPlay();
  }, [emblaApi, imageUrls.length, startAutoPlay, stopAutoPlay]);

  if (imageUrls.length === 0) {
    return (
      <div
        className="absolute inset-0 z-0 bg-linear-to-br from-zinc-950 via-black to-emerald-950/30"
        aria-hidden
      />
    );
  }

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden"
      ref={emblaRef}
      aria-hidden
    >
      <div className="flex h-full">
        {imageUrls.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative h-full min-w-0 flex-[0_0_100%]"
          >
            <Image
              src={src}
              alt=""
              fill
              className="object-cover scale-110 blur-2xl opacity-80"
              sizes="100vw"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              unoptimized={src.startsWith("data:")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
