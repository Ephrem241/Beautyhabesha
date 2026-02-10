"use client";

import { memo, type ReactNode } from "react";
import { LockOverlay } from "./LockOverlay";

type PremiumProfileCardProps = {
  isLocked: boolean;
  children: ReactNode;
  upgradeHref?: string;
  className?: string;
  variant?: "default" | "centered";
};

export const PremiumProfileCard = memo(function PremiumProfileCard({
  isLocked,
  children,
  upgradeHref = "/pricing",
  className = "",
  variant = "default",
}: PremiumProfileCardProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  const wrapperClass =
    variant === "centered"
      ? "mx-auto max-w-md aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl"
      : "h-full overflow-hidden rounded-3xl shadow-2xl";

  return (
    <div
      className={`relative ${wrapperClass} ${className}`.trim()}
    >
      <div
        className="absolute inset-0 transition-all duration-300 will-change-filter"
        style={{
          filter: "blur(4px) brightness(0.75)",
        }}
      >
        {children}
      </div>
      <LockOverlay upgradeHref={upgradeHref} />
    </div>
  );
});
