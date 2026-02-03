"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ButtonLink } from "@/app/_components/ui/Button";

export type HeroSlide = {
  id: string;
  headline: string;
  subtitle: string;
  cta?: {
    label: string;
    href: string;
  };
};

type HeroCarouselProps = {
  slides: HeroSlide[];
  /** Auto-advance interval in ms. Default 4000. Set 0 to disable. */
  autoPlayInterval?: number;
  /** Pause auto-play for this many ms after user interaction. Default 8000. */
  pauseAfterInteractionMs?: number;
  /** Optional aria-label for the carousel region. */
  ariaLabel?: string;
  className?: string;
};

const DEFAULT_INTERVAL = 4000;
const DEFAULT_PAUSE_AFTER_INTERACTION = 8000;

export function HeroCarousel({
  slides,
  autoPlayInterval = DEFAULT_INTERVAL,
  pauseAfterInteractionMs = DEFAULT_PAUSE_AFTER_INTERACTION,
  ariaLabel = "Hero carousel",
  className = "",
}: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    duration: 25,
    skipSnaps: false,
    watchDrag: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseUntilRef = useRef<number>(0);
  const isPausedByUserRef = useRef(false);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const startAutoPlay = useCallback(() => {
    if (autoPlayInterval <= 0 || !emblaApi) return;

    const advance = () => {
      if (isPausedByUserRef.current || Date.now() < pauseUntilRef.current) return;
      emblaApi.scrollNext();
    };

    autoPlayTimerRef.current = setInterval(advance, autoPlayInterval);
  }, [emblaApi, autoPlayInterval]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  const pauseForUserInteraction = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    isPausedByUserRef.current = true;
    pauseUntilRef.current = Date.now() + pauseAfterInteractionMs;
    stopAutoPlay();
    resumeTimeoutRef.current = setTimeout(() => {
      isPausedByUserRef.current = false;
      resumeTimeoutRef.current = null;
      startAutoPlay();
    }, pauseAfterInteractionMs);
  }, [pauseAfterInteractionMs, stopAutoPlay, startAutoPlay]);

  const onSelect = useCallback(
    (api: NonNullable<typeof emblaApi>) => {
      setSelectedIndex(api.selectedScrollSnap());
    },
    []
  );

  useEffect(() => {
    if (!emblaApi) return;
    queueMicrotask(() => onSelect(emblaApi));
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || autoPlayInterval <= 0) return;
    startAutoPlay();
    return () => {
      stopAutoPlay();
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
    };
  }, [emblaApi, autoPlayInterval, startAutoPlay, stopAutoPlay]);

  const handlePointerDown = useCallback(() => {
    pauseForUserInteraction();
  }, [pauseForUserInteraction]);

  if (slides.length === 0) return null;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 sm:rounded-3xl ${className}`}
      aria-label={ariaLabel}
      aria-roledescription="carousel"
      role="region"
    >
      <div
        className="overflow-hidden"
        ref={emblaRef}
        onPointerDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <div className="flex touch-pan-y">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative min-w-0 flex-[0_0_100%] px-4 py-12 sm:px-8 sm:py-16 md:px-12 md:py-20"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${slides.length}`}
              aria-live={selectedIndex === index ? "polite" : "off"}
            >
              <div className="mx-auto max-w-3xl text-center">
                <h2 className="text-2xl font-semibold text-white sm:text-3xl md:text-4xl lg:text-5xl">
                  {slide.headline}
                </h2>
                <p className="mt-3 text-sm text-zinc-400 sm:mt-4 sm:text-base md:text-lg">
                  {slide.subtitle}
                </p>
                {slide.cta ? (
                  <div className="mt-6 flex flex-wrap justify-center gap-3 sm:mt-8">
                    <ButtonLink
                      href={slide.cta.href}
                      size="md"
                      className="focus-visible:outline-emerald-400"
                    >
                      {slide.cta.label}
                    </ButtonLink>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div
        className="flex justify-center gap-2 pb-6 pt-2 sm:pb-8 sm:pt-4"
        role="tablist"
        aria-label="Carousel slide indicators"
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={selectedIndex === index}
            aria-label={`Go to slide ${index + 1}`}
            tabIndex={selectedIndex === index ? 0 : -1}
            onClick={() => {
              scrollTo(index);
              pauseForUserInteraction();
            }}
            className={`h-2.5 w-2.5 shrink-0 rounded-full transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
              selectedIndex === index
                ? "scale-125 bg-emerald-400"
                : "bg-zinc-600 hover:bg-zinc-500"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
