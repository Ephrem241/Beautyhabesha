"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { ProfileAvatar } from "./ProfileAvatar";
import { ButtonLink } from "./ui/Button";

const AUTO_PLAY_MS = 4000;
const BLUR_PLACEHOLDER =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z";

type SpotlightProfile = {
  id: string;
  displayName: string;
  city: string | null;
  bio: string | null;
  images: string[];
};

type SpotlightCarouselProps = {
  profiles: SpotlightProfile[];
  intervalMs?: number;
};

export const SpotlightCarousel = memo(function SpotlightCarousel({
  profiles,
  intervalMs = AUTO_PLAY_MS,
}: SpotlightCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    duration: 30,
    skipSnaps: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const startAutoPlay = useCallback(() => {
    if (!emblaApi || profiles.length <= 1 || isPaused) return;
    autoPlayRef.current = setInterval(() => {
      emblaApi.scrollNext();
    }, intervalMs);
  }, [emblaApi, profiles.length, intervalMs, isPaused]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || profiles.length <= 1) return;
    if (!isPaused) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [emblaApi, profiles.length, startAutoPlay, stopAutoPlay, isPaused]);

  if (profiles.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
        No Platinum profiles yet. Upgrade to appear here.
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="relative min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%]"
            >
              <article className="mx-2 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 transition hover:-translate-y-0.5 hover:border-emerald-500/60 sm:rounded-3xl">
                <div className="relative w-full aspect-[4/5]">
                  {profile.images[0] ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={profile.images[0]}
                        alt={profile.displayName}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover will-change-transform"
                        style={{
                          transform: "scale(1.05)",
                          filter: "blur(8px)",
                        }}
                        placeholder="blur"
                        blurDataURL={BLUR_PLACEHOLDER}
                        priority={selectedIndex === profiles.findIndex(p => p.id === profile.id)}
                      />
                      <div className="absolute inset-0 bg-black/20" />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-zinc-900 via-black to-emerald-950/60 text-xs uppercase tracking-[0.3em] text-zinc-500">
                      No image
                    </div>
                  )}
                  <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
                    Featured
                  </span>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      src={profile.images[0]}
                      alt={profile.displayName}
                      size={44}
                      className="shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {profile.displayName}
                      </h3>
                      <p className="text-xs text-zinc-500">{profile.city}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-zinc-400 line-clamp-2">
                    {profile.bio ?? "Premium spotlight profile."}
                  </p>
                  <ButtonLink
                    href={`/profiles/${profile.id}`}
                    variant="ghost"
                    className="mt-4"
                  >
                    View profile
                  </ButtonLink>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      {profiles.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {profiles.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`h-2 rounded-full transition-all ${
                index === selectedIndex
                  ? "w-6 bg-emerald-500"
                  : "w-2 bg-zinc-600 hover:bg-zinc-500"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

