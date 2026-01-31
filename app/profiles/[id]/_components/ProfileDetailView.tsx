"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PublicEscort } from "@/lib/escorts";
import Image from "next/image";
import Link from "next/link";

import { ProfileCard } from "./ProfileCard";
import { ContactButton } from "./ContactButton";
import { TelegramButton } from "@/app/_components/TelegramButton";

type ProfileDetailViewProps = {
  profile: PublicEscort;
  hasActiveSubscription: boolean;
  upgradeHref: string;
};

export function ProfileDetailView({
  profile,
  hasActiveSubscription,
  upgradeHref,
}: ProfileDetailViewProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const images = profile.images;
  const mainImage = images[imageIndex] ?? images[0] ?? null;
  const canShowContact = hasActiveSubscription && profile.canShowContact;

  const goToImage = (idx: number) => {
    if (images.length <= 1) return;
    setImageIndex((i) => {
      const next = i + idx;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  return (
    <div className="relative min-h-screen bg-black pb-[76px] md:pb-[84px]">
      {/* Sticky header */}
      <ProfileCard
        name={profile.displayName}
        city={profile.city}
        imageUrl={profile.images[0]}
      />

      {/* Main hero image */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative mt-0 w-full overflow-hidden"
      >
        <div
          className={`relative h-[80vh] w-full overflow-hidden rounded-b-3xl ${
            !canShowContact ? "select-none" : ""
          }`}
        >
          {mainImage ? (
            <>
              <AnimatePresence mode="wait" initial={false}>
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
                    className={`object-cover transition-all duration-500 ${
                      hasActiveSubscription ? "" : "blur-lg"
                    }`}
                    priority={imageIndex === 0}
                  />
                </motion.div>
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => goToImage(-1)}
                    className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                    aria-label="Previous image"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => goToImage(1)}
                    className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition hover:bg-black/70"
                    aria-label="Next image"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setImageIndex(i)}
                        className={`h-1.5 w-1.5 rounded-full transition ${
                          i === imageIndex ? "w-4 bg-white" : "bg-white/50 hover:bg-white/70"
                        }`}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
              {!canShowContact && (
                <div
                  className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/50 px-4"
                  aria-hidden="false"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-zinc-500/80 bg-zinc-900/90">
                    <LockIcon className="h-7 w-7 text-zinc-400" />
                  </div>
                  <p className="text-center text-base font-medium text-white">
                    Subscribe to unlock contact
                  </p>
                  <Link
                    href={upgradeHref}
                    className="pointer-events-auto rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
                  >
                    Upgrade Now
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-zinc-900 text-zinc-500">
              <span className="text-sm uppercase tracking-widest">
                No image
              </span>
            </div>
          )}
        </div>
      </motion.section>

      {/* Bio section (below fold, optional) */}
      {profile.bio && canShowContact && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="px-4 py-6"
        >
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
            About
          </h2>
          <p className="mt-3 text-sm text-zinc-300">{profile.bio}</p>
        </motion.section>
      )}

      <TelegramButton
        telegram={profile.telegram}
        locked={!canShowContact}
      />

      {/* Sticky bottom CTA */}
      <ContactButton
        profileId={profile.id}
        displayName={profile.displayName}
        telegram={profile.contact?.telegram}
        phone={profile.contact?.phone}
        disabled={!canShowContact}
      />
    </div>
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
