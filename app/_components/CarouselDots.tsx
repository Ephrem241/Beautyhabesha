"use client";

import { motion } from "framer-motion";

type CarouselDotsProps = {
  count: number;
  activeIndex: number;
  onSelect: (index: number) => void;
  className?: string;
};

export function CarouselDots({
  count,
  activeIndex,
  onSelect,
  className = "",
}: CarouselDotsProps) {
  if (count <= 0) return null;

  return (
    <div
      className={`flex -translate-x-1/2 items-center justify-center gap-2 ${className}`.trim()}
      role="tablist"
      aria-label="Image carousel pagination"
    >
      {Array.from({ length: count }, (_, i) => {
        const isActive = i === activeIndex;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Image ${i + 1}`}
            aria-current={isActive ? "true" : undefined}
            role="tab"
            className="flex items-center justify-center p-1 outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className={`rounded-full ${
                isActive
                  ? "h-2 w-6 bg-green-500"
                  : "h-2 w-2 bg-white/40 transition-colors duration-200 hover:bg-white/50"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
