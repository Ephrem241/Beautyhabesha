"use client";

import { useState, useCallback } from "react";
import type { PublicEscort } from "@/lib/escorts";
import { useSwipe } from "./useSwipe";
import { SwipeCard } from "./SwipeCard";
import { TelegramButton } from "@/app/_components/TelegramButton";
import Link from "next/link";

const SWIPE_OUT_X = 500;

type SwipeDeckProps = {
  profiles: PublicEscort[];
  hasActiveSubscription: boolean;
};

const SWIPE_ANIM_MS = 350;

export function SwipeDeck({
  profiles,
  hasActiveSubscription,
}: SwipeDeckProps) {
  const [exitX, setExitX] = useState(0);

  const { index, goNext, goPrev } = useSwipe({
    count: profiles.length,
  });

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      const x = info.offset.x;
      if (x > 120) {
        setExitX(SWIPE_OUT_X);
        setTimeout(() => {
          goPrev();
          setExitX(0);
        }, SWIPE_ANIM_MS);
      } else if (x < -120) {
        setExitX(-SWIPE_OUT_X);
        setTimeout(() => {
          goNext();
          setExitX(0);
        }, SWIPE_ANIM_MS);
      }
    },
    [goNext, goPrev]
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
          className="relative h-full w-full max-w-md"
          style={{ perspective: "1000px" }}
        >
          {nextProfile && (
            <div
              className="absolute inset-0 scale-[0.92]"
              style={{ zIndex: 1 }}
            >
              <SwipeCard
                profile={nextProfile}
                isTop={false}
                hasActiveSubscription={hasActiveSubscription}
                onDragEnd={() => {}}
                exitX={0}
              />
            </div>
          )}

          {currentProfile && (
            <SwipeCard
              key={`${currentProfile.id}-${index}`}
              profile={currentProfile}
              isTop
              hasActiveSubscription={hasActiveSubscription}
              onDragEnd={handleDragEnd}
              exitX={exitX}
            />
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
          onClick={goPrev}
          disabled={index <= 0}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-zinc-600 bg-black/50 text-zinc-400 backdrop-blur-sm transition hover:border-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
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
          onClick={goNext}
          disabled={index >= profiles.length - 1}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-zinc-600 bg-black/50 text-zinc-400 backdrop-blur-sm transition hover:border-zinc-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
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
