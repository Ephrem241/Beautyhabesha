"use client";

import { type ReactNode } from "react";
import { LockOverlay } from "./LockOverlay";

type PremiumProfileCardProps = {
  isLocked: boolean;
  children: ReactNode;
  upgradeHref?: string;
  className?: string;
  variant?: "default" | "centered";
};

export function PremiumProfileCard({
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
      <div className="absolute inset-0 blur-sm brightness-75 transition-all duration-300">
        {children}
      </div>
      <LockOverlay upgradeHref={upgradeHref} />
    </div>
  );
}
