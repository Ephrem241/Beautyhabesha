import type { PublicEscort } from "@/lib/escorts";
import type { Profile } from "@/app/_components/swipe/types";

export function mapPublicEscortToProfile(escort: PublicEscort): Profile {
  return {
    id: escort.id,
    name: escort.displayName,
    image: escort.images[0] ?? "",
    images: escort.images ?? [],
    isPremium: escort.planId !== "Normal",
    subscription:
      escort.planId === "VIP"
        ? "vip"
        : escort.planId === "Platinum"
          ? "platinum"
          : null,
    lastActiveAt: escort.lastActiveAt ?? undefined,
  };
}
