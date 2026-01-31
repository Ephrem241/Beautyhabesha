"use client";

import { motion } from "framer-motion";
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
  const canShowContact = hasActiveSubscription && profile.canShowContact;
  const mainImage = profile.images[0] ?? null;

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
          {mainImage ? (
            <Image
              src={mainImage}
              alt={profile.displayName}
              fill
              sizes="100vw"
              className={`object-cover transition-all duration-300 ${
                canShowContact ? "" : "blur-md"
              }`}
              priority={isTop}
              draggable={false}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-800 text-zinc-500">
              <span className="text-sm uppercase tracking-widest">
                No image
              </span>
            </div>
          )}

          {!canShowContact && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 px-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-zinc-500/80 bg-zinc-900/90">
                <LockIcon className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-center text-sm font-medium text-white">
                Subscribe to unlock
              </p>
              <Link
                href="/pricing"
                className="rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
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
          </div>
        </div>

        <div className="flex gap-3 border-t border-zinc-800 bg-black/90 p-4">
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
