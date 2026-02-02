"use client";

import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Profile } from "./types";
import type { SwipeOutcome } from "./SwipeCard";
import { ProfileSwipeCard } from "@/app/_components/profile/ProfileSwipeCard";
import { useSwipe } from "./useSwipe";

const SWIPE_ANIM_MS = 350;

export type SwipeDeckProps = {
  profiles: Profile[];
  onLike?: (profile: Profile) => void;
  onReject?: (profile: Profile) => void;
  onViewProfile?: (profile: Profile) => void;
  onIndexChange?: (index: number) => void;
};

export function SwipeDeck({
  profiles,
  onLike,
  onReject,
  onViewProfile,
  onIndexChange,
}: SwipeDeckProps) {
  const [exitOutcome, setExitOutcome] = useState<SwipeOutcome>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const { index, goNext } = useSwipe({ count: profiles.length });

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

  return (
    <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
        <Link
          href="/escorts"
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
        <span className="rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {index + 1} / {profiles.length}
        </span>
      </div>

      <div className="absolute inset-4 top-16 bottom-4 flex items-center justify-center">
        <div
          className="relative h-full w-full max-w-md overflow-hidden"
          style={{ perspective: "1000px" }}
        >
          {nextProfile && !isAnimating && (
            <motion.div
              key={`next-${nextProfile.id}`}
              initial={{ scale: 0.95, opacity: 0.9 }}
              animate={{ scale: 0.95, opacity: 0.9 }}
              className="absolute inset-0"
              style={{ zIndex: 1 }}
            >
              <ProfileSwipeCard
                profile={nextProfile}
                isTop={false}
                onDragEnd={() => {}}
                exitOutcome={null}
              />
            </motion.div>
          )}

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
              />
            </motion.div>
          )}
        </div>
      </div>

    </div>
  );
}
