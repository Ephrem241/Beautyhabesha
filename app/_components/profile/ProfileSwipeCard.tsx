"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import type { Profile } from "@/app/_components/swipe/types";
import type { SwipeOutcome } from "@/app/_components/swipe/SwipeCard";
import { OnlineBadge } from "@/app/_components/OnlineBadge";
import { ProfileAvatar } from "@/app/_components/ProfileAvatar";
import { BlurGate } from "@/app/_components/BlurGate";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";

const THRESHOLD_X = 100;
const THRESHOLD_Y_UP = -120;
const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

type ProfileSwipeCardProps = {
  profile: Profile;
  isTop: boolean;
  onDragEnd: (outcome: SwipeOutcome) => void;
  exitOutcome: SwipeOutcome;
  /** Whether the viewer has an active subscription (for blur protection). */
  viewerHasAccess?: boolean;
};

export function ProfileSwipeCard({
  profile,
  isTop,
  onDragEnd,
  exitOutcome,
  viewerHasAccess,
}: ProfileSwipeCardProps) {
  const images =
    profile.images?.length ? profile.images : profile.image ? [profile.image] : [];
  const [activeIndex, setActiveIndex] = useState(0);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, (v) => v / 20);
  const opacity = useTransform(x, (v) => Math.max(0.5, 1 - Math.abs(v) / 400));

  const handleDrag = useCallback(
    (_: unknown, info: { offset: { x: number; y: number } }) => {
      x.set(info.offset.x);
      y.set(info.offset.y);
    },
    [x, y]
  );

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }) => {
      if (!isTop) return;
      const { offset, velocity } = info;
      if (offset.y < THRESHOLD_Y_UP && Math.abs(velocity.y) > 50) {
        onDragEnd("view");
        return;
      }
      if (offset.x > THRESHOLD_X || velocity.x > 200) {
        onDragEnd("like");
        return;
      }
      if (offset.x < -THRESHOLD_X || velocity.x < -200) {
        onDragEnd("reject");
        return;
      }
      animate(x, 0, SPRING);
      animate(y, 0, SPRING);
      onDragEnd(null);
    },
    [isTop, onDragEnd, x, y]
  );

  const exitX = exitOutcome === "like" ? 500 : exitOutcome === "reject" ? -500 : 0;
  const exitY = exitOutcome === "view" ? -400 : 0;

  const goPrev = useCallback(() => {
    if (images.length <= 1) return;
    setActiveIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback(() => {
    if (images.length <= 1) return;
    setActiveIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const goToIndex = useCallback((index: number) => {
    setActiveIndex((i) => (index >= 0 && index < images.length ? index : i));
  }, [images.length]);

  const currentImage = images[activeIndex] ?? images[0] ?? null;
  const avatarSrc = images[0] ?? profile.image ?? null;

  return (
    <motion.div
      drag={isTop}
      dragConstraints={false}
      dragElastic={0.8}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      style={{
        x,
        y,
        rotate,
        opacity: exitOutcome ? undefined : opacity,
        zIndex: isTop ? 10 : 5,
        cursor: isTop ? "grab" : "default",
      }}
      initial={false}
      animate={
        isTop && exitOutcome
          ? {
              x: exitX,
              y: exitY,
              opacity: 0,
              transition: SPRING,
            }
          : undefined
      }
      transition={SPRING}
      className="absolute inset-0 touch-none select-none will-change-transform"
      whileDrag={isTop ? { cursor: "grabbing" } : undefined}
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-3xl bg-neutral-900 shadow-2xl">
        <div className="relative min-h-0 flex-1 w-full overflow-hidden">
          <BlurGate
            isAllowed={viewerHasAccess ?? false}
            className="absolute inset-0"
            upgradeHref="/pricing"
          >
            {currentImage ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={currentImage}
                    alt={`${profile.name} ${activeIndex + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover brightness-95"
                    priority={isTop}
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-neutral-800 text-neutral-500 text-sm uppercase tracking-widest">
                No image
              </div>
            )}
          </BlurGate>

          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent backdrop-blur-sm"
            aria-hidden
          />

          <header className="absolute left-3 top-3 z-10 flex items-center gap-3">
            <div className="relative">
              <div className="overflow-hidden rounded-full border-2 border-emerald-500">
                <ProfileAvatar
                  src={avatarSrc}
                  alt={profile.name}
                  size={48}
                  blurWhenLocked={!viewerHasAccess}
                  className="block"
                />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5">
                <OnlineBadge lastActiveAt={profile.lastActiveAt} />
              </span>
            </div>
            <h2 className="text-xl font-semibold text-white drop-shadow-sm">
              {profile.name}
            </h2>
          </header>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label="Previous image"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                aria-label="Next image"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-24 left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-2">
              {images.map((_, i) => {
                const isActive = i === activeIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      goToIndex(i);
                    }}
                    aria-label={`Image ${i + 1}`}
                    aria-current={isActive ? "true" : undefined}
                    className="flex items-center justify-center p-2 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    <motion.span
                      layout
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      className={`rounded-full ${
                        isActive
                          ? "h-2 w-6 bg-emerald-500"
                          : "h-2 w-2 bg-white/40"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 z-10">
            <Link
              href={`/profiles/${profile.id}`}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 text-white shadow-lg transition hover:bg-emerald-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              <svg
                className="h-5 w-5 shrink-0"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
              <span className="font-semibold">Contact</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
