"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { PublicEscort } from "@/lib/escorts";

const spring = { type: "spring" as const, stiffness: 300, damping: 25 };

type SwipeCardProps = {
  profile: PublicEscort;
  isTop: boolean;
  hasActiveSubscription: boolean;
  onDragEnd: (
    _: unknown,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => void;
  exitX: number;
};

export function SwipeCard({
  profile,
  isTop,
  hasActiveSubscription,
  onDragEnd,
  exitX,
}: SwipeCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const canShowContact = hasActiveSubscription && profile.canShowContact;

  useEffect(() => {
    setImageIndex(0);
  }, [profile.id]);
  const images = profile.images;
  const mainImage = images[imageIndex] ?? images[0] ?? null;

  const goToImage = (idx: number) => {
    if (images.length <= 1) return;
    setImageIndex((i) => {
      const next = i + idx;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  const getContactHref = () => {
    if (!canShowContact) return "#";
    if (profile.contact?.telegram) {
      const handle = profile.contact.telegram.replace(/^@/, "").trim();
      return handle ? `https://t.me/${handle}` : `/profiles/${profile.id}`;
    }
    if (profile.contact?.phone) {
      const digits = profile.contact.phone.replace(/\D/g, "");
      return digits ? `tel:${digits}` : `/profiles/${profile.id}`;
    }
    return `/chat/${profile.id}`;
  };

  return (
    <motion.div
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={onDragEnd}
      animate={
        isTop && exitX !== 0
          ? {
              x: exitX,
              opacity: 0,
              transition: { type: "spring", stiffness: 300, damping: 25 },
            }
          : undefined
      }
      initial={false}
      whileDrag={
        isTop
          ? { scale: 1.05, transition: { duration: 0 } }
          : undefined
      }
      transition={spring}
      className="absolute inset-0 touch-none select-none"
      style={{
        zIndex: isTop ? 10 : 5,
        cursor: isTop ? "grab" : "default",
      }}
    >
      <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-zinc-900">
        <div className="relative flex-1 overflow-hidden">
          <div
            className="relative h-full w-full"
            onClick={(e) => {
              if (!isTop || images.length <= 1) return;
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              if (x < rect.width / 2) goToImage(-1);
              else goToImage(1);
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {mainImage ? (
                <motion.div
                  key={imageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={mainImage}
                    alt={`${profile.displayName} - ${imageIndex + 1}`}
                    fill
                    sizes="100vw"
                    className={`object-cover transition-all duration-300 ${
                      hasActiveSubscription ? "" : "blur-lg"
                    }`}
                    priority={isTop}
                    draggable={false}
                  />
                </motion.div>
              ) : (
                <div
                  key="no-image"
                  className="flex h-full items-center justify-center bg-zinc-800 text-zinc-500"
                >
                  <span className="text-sm uppercase tracking-widest">
                    No image
                  </span>
                </div>
              )}
            </AnimatePresence>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToImage(-1);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute left-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-30"
                  aria-label="Previous image"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToImage(1);
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="absolute right-2 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70 disabled:opacity-30"
                  aria-label="Next image"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageIndex(i);
                      }}
                      onPointerDown={(e) => e.stopPropagation()}
                      className={`h-1.5 w-1.5 rounded-full transition ${
                        i === imageIndex
                          ? "w-4 bg-white"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={`Image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {!canShowContact && (
            <div
              className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/50 px-4"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-500/80 bg-zinc-900/90">
                <LockIcon className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-center text-sm font-medium text-white">
                Subscribe to unlock
              </p>
              <Link
                href="/pricing"
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                Upgrade
              </Link>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-16 pb-6 px-4">
            <h2 className="text-xl font-semibold text-white">
              {profile.displayName}
            </h2>
            {profile.city && (
              <p className="mt-1 text-sm text-zinc-300">{profile.city}</p>
            )}
            {images.length > 1 && (
              <p className="mt-1 text-xs text-zinc-400">
                {imageIndex + 1} / {images.length}
              </p>
            )}
          </div>
        </div>

        <div
          className="relative z-30 flex gap-3 border-t border-zinc-800 bg-black/90 p-4"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Link
            href={`/profiles/${profile.id}`}
            className="flex-1 rounded-xl border border-zinc-600 py-3 text-center text-sm font-semibold text-zinc-200 transition hover:bg-zinc-800"
          >
            View Profile
          </Link>
          <a
            href={getContactHref()}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition ${
              canShowContact
                ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
                : "cursor-not-allowed bg-zinc-700 text-zinc-500"
            }`}
            onClick={(e) => !canShowContact && e.preventDefault()}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Contact
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
      />
    </svg>
  );
}
