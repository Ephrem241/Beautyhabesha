"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Profile } from "./types";
import type { SwipeOutcome } from "./SwipeCard";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";
import { ProfileSwipeCard } from "@/app/_components/profile/ProfileSwipeCard";
import { useSwipe } from "./useSwipe";

const SWIPE_ANIM_MS = 350;

export type SwipeDeckProps = {
  profiles: Profile[];
  onLike?: (profile: Profile) => void;
  onReject?: (profile: Profile) => void;
  onViewProfile?: (profile: Profile) => void;
  onIndexChange?: (index: number) => void;
  /** When provided, back button switches view (e.g. grid) instead of navigating. */
  onBack?: () => void;
  /** Whether the viewer has an active subscription (for blur protection). */
  viewerHasAccess?: boolean;
};

export function SwipeDeck({
  profiles,
  onLike,
  onReject,
  onViewProfile,
  onIndexChange,
  onBack,
  viewerHasAccess,
}: SwipeDeckProps) {
  const [exitOutcome, setExitOutcome] = useState<SwipeOutcome>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const { index, goNext, goPrev } = useSwipe({ count: profiles.length });

  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  const handleSwipeEnd = useCallback(
    (outcome: SwipeOutcome) => {
      if (isAnimating || outcome === null) return;
      const current = profiles[index];
      if (!current) return;

      setIsAnimating(true);
      setExitOutcome(outcome);

      const timer = setTimeout(() => {
        setExitOutcome(null);
        if (outcome === "view") {
          onViewProfile?.(current);
        } else if (outcome === "like") {
          onLike?.(current);
        } else {
          onReject?.(current);
        }
        goNext();
        setIsAnimating(false);
      }, SWIPE_ANIM_MS);

      return () => clearTimeout(timer);
    },
    [index, profiles, isAnimating, goNext, onLike, onReject, onViewProfile]
  );

  if (profiles.length === 0) {
    return (
      <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 px-4">
        <p className="text-center text-zinc-400">No profiles to browse yet.</p>
        <Link
          href="/escorts"
          className="rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
        >
          View all profiles
        </Link>
      </div>
    );
  }

  const currentProfile = profiles[index];
  const nextProfile = profiles[index + 1];
  const bgImageUrl =
    currentProfile?.images?.[0] ?? currentProfile?.image ?? null;

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden pt-[calc(3.5rem+env(safe-area-inset-top,0))] sm:pt-[calc(4rem+env(safe-area-inset-top,0))]">
      <div className="absolute inset-0 z-0">
        {bgImageUrl ? (
          <Image
            src={bgImageUrl}
            alt=""
            fill
            className="object-cover"
            style={{ filter: "blur(40px) brightness(0.6)", transform: "scale(1.1)" }}
            sizes="100vw"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-black"
            aria-hidden
          />
        )}
      </div>

      <div className="absolute left-4 top-4 z-50 flex items-center gap-2 pointer-events-auto">
        {onBack ? (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
            aria-label="Back"
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
        ) : (
          <Link
            href="/escorts"
            onPointerDown={(e) => e.stopPropagation()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
            aria-label="Back"
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
          </Link>
        )}
        <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {index + 1} / {profiles.length}
        </span>
      </div>

      <div className="absolute inset-1 top-12 bottom-1 flex items-center justify-center">
        <div
          className="relative h-full w-full overflow-hidden"
          style={{ perspective: "1000px" }}
        >
          {currentProfile && (
            <motion.div
              key={`current-${currentProfile.id}-${index}`}
              initial={{ scale: 0.95, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0"
              style={{ zIndex: 10 }}
            >
              <ProfileSwipeCard
                profile={currentProfile}
                isTop={!isAnimating}
                onDragEnd={handleSwipeEnd}
                exitOutcome={exitOutcome}
                viewerHasAccess={viewerHasAccess}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Navigation Buttons - Previous/Next Model */}
      <div className="absolute inset-x-0 top-1/2 z-50 flex items-center justify-between px-4 pointer-events-none sm:px-6">
        {/* Previous Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (index > 0 && !isAnimating) {
              goPrev();
            }
          }}
          disabled={index === 0 || isAnimating}
          className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/80 hover:scale-110 active:scale-95 ${
            index === 0 || isAnimating ? "opacity-30 cursor-not-allowed" : "opacity-90"
          }`}
          aria-label="Previous model"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (index < profiles.length - 1 && !isAnimating) {
              goNext();
            }
          }}
          disabled={index === profiles.length - 1 || isAnimating}
          className={`pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-all hover:bg-black/80 hover:scale-110 active:scale-95 ${
            index === profiles.length - 1 || isAnimating ? "opacity-30 cursor-not-allowed" : "opacity-90"
          }`}
          aria-label="Next model"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

    </div>
  );
}
