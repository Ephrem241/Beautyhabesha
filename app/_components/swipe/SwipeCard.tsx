"use client";

import { useCallback } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import Image from "next/image";
import type { Profile } from "./types";
import { PremiumBadge } from "@/app/_components/ui/PremiumBadge";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";

const THRESHOLD_X = 100;
const THRESHOLD_Y_UP = -120;
const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

export type SwipeOutcome = "like" | "reject" | "view" | null;

type SwipeCardProps = {
  profile: Profile;
  isTop: boolean;
  onDragEnd: (outcome: SwipeOutcome) => void;
  exitOutcome: SwipeOutcome;
};

export function SwipeCard({
  profile,
  isTop,
  onDragEnd,
  exitOutcome,
}: SwipeCardProps) {
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

  const glowClass =
    exitOutcome === "like"
      ? "shadow-[0_0_40px_rgba(34,197,94,0.5)]"
      : exitOutcome === "reject"
        ? "shadow-[0_0_40px_rgba(239,68,68,0.5)]"
        : "";

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
      <div
        className={`flex h-full w-full flex-col overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ${glowClass}`}
      >
        <div className="relative h-full w-full overflow-hidden aspect-4/5">
          {profile.image ? (
            <Image
              src={profile.image}
              alt={profile.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={isTop}
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              draggable={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 text-zinc-500 text-sm uppercase tracking-widest">
              No image
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/90 via-black/50 to-transparent pt-16 pb-4 px-4 blur-sm" />
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 via-transparent to-transparent pt-12 pb-4 px-4">
            <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
            {profile.age != null && (
              <p className="mt-1 text-sm text-zinc-300">{profile.age} years</p>
            )}
          </div>
          {profile.subscription && (
            <PremiumBadge type={profile.subscription} />
          )}
        </div>
      </div>
    </motion.div>
  );
}
