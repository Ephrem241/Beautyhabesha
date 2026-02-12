"use client";

import { motion } from "framer-motion";
import type { PublicEscort } from "@/lib/escorts";

import { ProfileCard } from "./ProfileCard";
import { ContactButton } from "./ContactButton";
import { PremiumProfileCard } from "@/app/_components/PremiumProfileCard";
import { ImageCarousel } from "@/app/_components/ImageCarousel";

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
  // Contact button redirects to admin, so only viewer subscription matters
  const canShowContact = hasActiveSubscription;

  return (
    <div className="relative min-h-screen bg-black pb-[88px] md:pb-[96px]">
      {/* Sticky header */}
      <ProfileCard
        name={profile.displayName}
        city={profile.city}
        imageUrl={profile.images[0]}
        lastActiveAt={profile.lastActiveAt}
      />

      {/* Main hero – centered premium card */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative mt-0 w-full px-4 py-6"
      >
        <div
          className={`flex justify-center ${
            !hasActiveSubscription ? "select-none" : ""
          }`}
        >
          <PremiumProfileCard
            isLocked={!hasActiveSubscription}
            upgradeHref={upgradeHref}
            variant="centered"
            className="w-full"
          >
            <div className="relative h-full w-full">
              <ImageCarousel
                images={profile.images}
                altPrefix={profile.displayName}
                autoPlayInterval={3000}
                priority
                className="h-full rounded-3xl"
                allowFullQuality={hasActiveSubscription}
                displayName={profile.displayName}
              />
            </div>
          </PremiumProfileCard>
        </div>
      </motion.section>

      {/* Bio / Description (below fold, optional) */}
      {(profile.bio || profile.description) && canShowContact && (
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="px-4 py-6"
        >
          {profile.bio && (
            <>
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                About
              </h2>
              <p className="mt-3 text-sm text-zinc-300">{profile.bio}</p>
            </>
          )}
          {profile.description && (
            <div className={profile.bio ? "mt-6" : ""}>
              <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
                Description
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm text-zinc-300">
                {profile.description}
              </p>
            </div>
          )}
        </motion.section>
      )}

      {/* Sticky bottom CTA */}
      <ContactButton
        profileId={profile.id}
        disabled={!canShowContact}
        upgradeHref={upgradeHref}
        displayName={profile.displayName}
      />
    </div>
  );
}
