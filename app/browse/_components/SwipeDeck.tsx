"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { PublicEscort } from "@/lib/escorts";
import { useSwipe } from "./useSwipe";
import { SwipeCard } from "./SwipeCard";
import { TelegramButton } from "@/app/_components/TelegramButton";
import Link from "next/link";

const SWIPE_OUT_X = 500;
const SWIPE_ANIM_MS = 300;

type SwipeDeckProps = {
  profiles: PublicEscort[];
  hasActiveSubscription: boolean;
};

export function SwipeDeck({
  profiles,
  hasActiveSubscription,
}: SwipeDeckProps) {
  const [exitX, setExitX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const { index, goNext, goPrev } = useSwipe({
    count: profiles.length,
  });

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (isAnimating) return;
      const x = info.offset.x;
      if (x > 120) {
        setIsAnimating(true);
        setExitX(SWIPE_OUT_X);
        setTimeout(() => {
          setExitX(0);
          goPrev();
          setIsAnimating(false);
        }, SWIPE_ANIM_MS);
      } else if (x < -120) {
        setIsAnimating(true);
        setExitX(-SWIPE_OUT_X);
        setTimeout(() => {
          setExitX(0);
          goNext();
          setIsAnimating(false);
        }, SWIPE_ANIM_MS);
      }
    },
    [goNext, goPrev, isAnimating]
  );

  const handleNavClick = useCallback(
    (dir: "prev" | "next") => {
      if (isAnimating) return;
      setIsAnimating(true);
      if (dir === "prev") {
        setExitX(SWIPE_OUT_X);
        setTimeout(() => {
          setExitX(0);
          goPrev();
          setIsAnimating(false);
        }, SWIPE_ANIM_MS);
      } else {
        setExitX(-SWIPE_OUT_X);
        setTimeout(() => {
          setExitX(0);
          goNext();
          setIsAnimating(false);
        }, SWIPE_ANIM_MS);
      }
    },
    [goNext, goPrev, isAnimating]
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
  const canShowContact = hasActiveSubscription && currentProfile.canShowContact;

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
              initial={{ scale: 0.92, opacity: 0.9 }}
              animate={{ scale: 0.92, opacity: 0.9 }}
              className="absolute inset-0"
              style={{ zIndex: 1 }}
            >
              <SwipeCard
                profile={nextProfile}
                isTop={false}
                hasActiveSubscription={hasActiveSubscription}
                onDragEnd={() => {}}
                exitX={0}
              />
            </motion.div>
          )}

          {currentProfile && (
            <motion.div
              key={`current-${currentProfile.id}-${index}`}
              initial={{ scale: 0.92, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0"
              style={{ zIndex: 10 }}
            >
              <SwipeCard
                profile={currentProfile}
                isTop={!isAnimating}
                hasActiveSubscription={hasActiveSubscription}
                onDragEnd={handleDragEnd}
                exitX={exitX}
              />
            </motion.div>
          )}
        </div>
      </div>

      <TelegramButton
        telegram={currentProfile.telegram}
        locked={!canShowContact}
      />

      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-6 px-4 safe-area-inset-bottom">
        <button
          type="button"
          onClick={() => handleNavClick("prev")}
          disabled={index <= 0 || isAnimating}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-zinc-600 bg-black/50 text-zinc-400 backdrop-blur-sm transition hover:border-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-600 disabled:hover:text-zinc-400"
          aria-label="Previous"
        >
          <svg
            className="h-6 w-6"
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
          onClick={() => handleNavClick("next")}
          disabled={index >= profiles.length - 1 || isAnimating}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-zinc-600 bg-black/50 text-zinc-400 backdrop-blur-sm transition hover:border-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-zinc-600 disabled:hover:text-zinc-400"
          aria-label="Next"
        >
          <svg
            className="h-6 w-6"
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
      </div>
    </div>
  );
}
