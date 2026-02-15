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
  const wrapperClass =
    variant === "centered"
      ? "mx-auto max-w-md aspect-[4/5] overflow-hidden rounded-3xl shadow-2xl"
      : "h-full overflow-hidden rounded-3xl shadow-2xl";

  return (
    <div
      className={`relative ${wrapperClass} ${className}`.trim()}
    >
      {isLocked ? (
        <>
          <div
            className="absolute inset-0 overflow-hidden transition-all duration-300 will-change-filter"
            style={{
              filter: "blur(20px) brightness(0.40)",
            }}
          >
            {children}
          </div>
          <LockOverlay upgradeHref={upgradeHref} />
        </>
      ) : (
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          {children}
        </div>
      )}
    </div>
  );
});
