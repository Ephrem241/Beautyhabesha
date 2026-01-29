"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";

type BilingualSlide = {
  id: string;
  type: "bilingual";
  amharic: string;
  english: string[];
};

type TaglineSlide = {
  id: string;
  type: "tagline";
  tagline: string;
};

type HeroTextSlide = BilingualSlide | TaglineSlide;

const DEFAULT_SLIDES: HeroTextSlide[] = [
  {
    id: "ht-1",
    type: "bilingual",
    amharic: "ከመረጡት ሞዴል ጋር በመረጡት ሰአት",
    english: [
      "Meet who you want. When you want. No hustle",
      "Choose beauty that suits your taste.",
    ],
  },
  {
    id: "ht-2",
    type: "tagline",
    tagline: "Have Your moment with us",
  },
];

const AUTO_PLAY_INTERVAL_MS = 4500;
const PAUSE_AFTER_INTERACTION_MS = 8000;

export function HeroTextCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "center",
    duration: 28,
    skipSnaps: false,
    watchDrag: true,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pauseUntilRef = useRef<number>(0);
  const isPausedByUserRef = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  const startAutoPlay = useCallback(() => {
    if (reducedMotion || !emblaApi) return;

    const advance = () => {
      if (isPausedByUserRef.current || Date.now() < pauseUntilRef.current)
        return;
      emblaApi.scrollNext();
    };

    autoPlayTimerRef.current = setInterval(advance, AUTO_PLAY_INTERVAL_MS);
  }, [emblaApi, reducedMotion]);

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
    pauseUntilRef.current = Date.now() + PAUSE_AFTER_INTERACTION_MS;
    stopAutoPlay();
    resumeTimeoutRef.current = setTimeout(() => {
      isPausedByUserRef.current = false;
      resumeTimeoutRef.current = null;
      startAutoPlay();
    }, PAUSE_AFTER_INTERACTION_MS);
  }, [stopAutoPlay, startAutoPlay]);

  const onSelect = useCallback(
    (api: NonNullable<typeof emblaApi>) => {
      setSelectedIndex(api.selectedScrollSnap());
    },
    []
  );

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || reducedMotion) return;
    startAutoPlay();
    return () => {
      stopAutoPlay();
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
    };
  }, [emblaApi, reducedMotion, startAutoPlay, stopAutoPlay]);

  const handlePointerDown = useCallback(() => {
    pauseForUserInteraction();
  }, [pauseForUserInteraction]);

  const slides = DEFAULT_SLIDES;
  if (slides.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900/80 sm:rounded-3xl"
      aria-label="Hero banner"
      aria-roledescription="carousel"
      role="region"
    >
      {/* Optional subtle glow */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(52,211,153,0.08),transparent)]"
        aria-hidden="true"
      />

      <div
        className="relative overflow-hidden"
        ref={emblaRef}
        onPointerDown={handlePointerDown}
        onTouchStart={handlePointerDown}
      >
        <div className="flex touch-pan-y">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="relative min-w-0 flex-[0_0_100%] px-5 py-14 sm:px-8 sm:py-20 md:px-12 md:py-24"
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${slides.length}`}
              aria-live={selectedIndex === index ? "polite" : "off"}
            >
              <div className="mx-auto max-w-3xl text-center">
                {slide.type === "bilingual" ? (
                  <>
                    <p
                      className="text-2xl font-medium leading-snug text-white sm:text-3xl md:text-4xl lg:text-[2.5rem]"
                      lang="am"
                    >
                      {slide.amharic}
                    </p>
                    <div
                      className="mt-4 space-y-1 sm:mt-5 sm:space-y-1.5"
                      lang="en"
                    >
                      {slide.english.map((line, i) => (
                        <p
                          key={i}
                          className="text-base text-white/75 sm:text-lg md:text-xl"
                        >
                          {line}
                        </p>
                      ))}
                    </div>
                  </>
                ) : (
                  <p
                    lang="en"
                    className="text-xl font-medium text-white sm:text-2xl md:text-3xl lg:text-4xl"
                  >
                    {slide.tagline}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

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
