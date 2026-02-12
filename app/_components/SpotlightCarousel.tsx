"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { OnlineBadge } from "./OnlineBadge";
import { ProfileAvatar } from "./ProfileAvatar";
import { ButtonLink } from "./ui/Button";
import { BlurGate } from "./BlurGate";
import { ContactChip } from "./ContactChip";
import { ProfileSlider } from "./ProfileSlider";

const AUTO_PLAY_MS = 4000;

type SpotlightProfile = {
  id: string;
  displayName: string;
  city: string | null;
  bio: string | null;
  images: string[];
  lastActiveAt?: Date | null;
};

type SpotlightCarouselProps = {
  profiles: SpotlightProfile[];
  viewerHasAccess: boolean;
  intervalMs?: number;
};

export const SpotlightCarousel = memo(function SpotlightCarousel({
  profiles,
  viewerHasAccess,
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
  const touchResumeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const TOUCH_RESUME_DELAY_MS = 300;

  const handleTouchStart = useCallback(() => {
    if (touchResumeRef.current) {
      clearTimeout(touchResumeRef.current);
      touchResumeRef.current = null;
    }
    setIsPaused(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchResumeRef.current) {
      clearTimeout(touchResumeRef.current);
      touchResumeRef.current = null;
    }
    touchResumeRef.current = setTimeout(() => {
      touchResumeRef.current = null;
      setIsPaused(false);
    }, TOUCH_RESUME_DELAY_MS);
  }, []);

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
    // Defer initial sync to avoid synchronous setState in effect (react-hooks/set-state-in-effect)
    const sync = () => queueMicrotask(onSelect);
    emblaApi.on("select", onSelect);
    sync();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    return () => {
      if (touchResumeRef.current) {
        clearTimeout(touchResumeRef.current);
        touchResumeRef.current = null;
      }
    };
  }, []);

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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="relative min-w-0 flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] xl:flex-[0_0_25%]"
            >
              <article className="mx-1 flex flex-col overflow-hidden rounded-2xl border border-emerald-500/60 bg-zinc-950 shadow-[0_0_20px_rgba(16,185,129,0.15)] transition hover:-translate-y-0.5 hover:border-emerald-400/70 hover:shadow-[0_0_24px_rgba(16,185,129,0.2)] sm:rounded-3xl">
                {/* Image first – full-size, dominant */}
                <div className="relative flex-1 min-h-0 flex flex-col">
                  <div className="relative w-full min-h-[200px] aspect-4/5 shrink-0 bg-zinc-900">
                    <BlurGate
                      isAllowed={viewerHasAccess}
                      className="absolute inset-0"
                      upgradeHref="/pricing"
                    >
                      <ProfileSlider
                        images={profile.images}
                        altPrefix={profile.displayName}
                        autoPlayInterval={4000}
                        allowFullQuality={viewerHasAccess}
                        displayName={profile.displayName}
                        escortId={profile.id}
                        priority={selectedIndex === profiles.findIndex((p) => p.id === profile.id)}
                        className="h-full w-full"
                      />
                    </BlurGate>
                    {/* Avatar overlay – outside BlurGate, always sharp */}
                    <div className="absolute left-4 top-4 z-10 flex items-center gap-3">
                      <div className="relative shrink-0">
                        <ProfileAvatar
                          src={profile.images[0]}
                          alt={profile.displayName}
                          size={48}
                          greenRing
                          className="shrink-0"
                        />
                        <span className="absolute -bottom-0.5 -right-0.5">
                          <OnlineBadge lastActiveAt={profile.lastActiveAt} />
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold text-white truncate drop-shadow-sm">
                          {profile.displayName}
                        </h3>
                        <p className="text-xs text-zinc-500">{profile.city}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
                        Featured
                      </span>
                    </div>
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-black/5 to-transparent"
                      aria-hidden
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4 sm:p-6">
                    <p className="text-sm text-zinc-400">
                      {profile.bio ?? "Premium spotlight profile."}
                    </p>
                  </div>
                </div>

                {/* Action buttons and admin contact */}
                <div className="flex flex-col gap-2 border-t border-zinc-800 p-4 sm:p-6">
                  <ButtonLink href={`/profiles/${profile.id}`} className="w-full" variant="outline">
                    View profile
                  </ButtonLink>
                  {viewerHasAccess && (
                    <ButtonLink
                      href={`/profiles/${profile.id}/availability`}
                      variant="outline"
                      className="w-full"
                    >
                      Availability & Booking
                    </ButtonLink>
                  )}

                  {/* Admin Contact Buttons */}
                  <div className="mt-2 flex items-center justify-center pt-2 border-t border-zinc-800/50">
                    <ContactChip variant="compact" label="Contact admin:" />
                  </div>
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

