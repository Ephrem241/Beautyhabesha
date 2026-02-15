"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";

type ProtectedImageLightboxProps = {
  images: string[];
  initialIndex: number;
  onClose: () => void;
  altPrefix: string;
  /** When true, apply anti-download/copy protections. */
  allowFullQuality?: boolean;
};

export function ProtectedImageLightbox({
  images,
  initialIndex,
  onClose,
  altPrefix,
  allowFullQuality = true,
}: ProtectedImageLightboxProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const prefersReducedMotion = useReducedMotion();

  const goTo = useCallback(
    (delta: number) => {
      if (images.length <= 1) return;
      setActiveIndex((i) => {
        const next = i + delta;
        if (next < 0) return images.length - 1;
        if (next >= images.length) return 0;
        return next;
      });
    },
    [images.length]
  );

  useEffect(() => {
    setActiveIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goTo(-1);
      if (e.key === "ArrowRight") goTo(1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, goTo]);

  const mainImage = images[activeIndex] ?? images[0];
  if (!mainImage) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
        role="dialog"
        aria-modal="true"
        aria-label="Image viewer"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-50 rounded-full border border-zinc-600 bg-black/60 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        >
          Close
        </button>

        <motion.div
          className="relative flex h-full w-full max-w-6xl items-center justify-center px-16 py-20"
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <div
            className={`relative h-full w-full ${allowFullQuality ? "select-none [&_img]:pointer-events-none [&_img]:select-none [&_img]:drag-none" : ""}`.trim()}
            style={
              allowFullQuality
                ? {
                    WebkitTouchCallout: "none",
                    WebkitUserSelect: "none",
                    userSelect: "none",
                  }
                : undefined
            }
            onContextMenu={allowFullQuality ? (e) => e.preventDefault() : undefined}
            onCopy={allowFullQuality ? (e) => e.preventDefault() : undefined}
          >
            <Image
              src={mainImage}
              alt={`${altPrefix} - ${activeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              draggable={false}
              onDragStart={allowFullQuality ? (e) => e.preventDefault() : undefined}
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => goTo(-1)}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:left-4"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => goTo(1)}
                aria-label="Next image"
                className="absolute right-2 top-1/2 z-50 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 sm:right-4"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-sm text-white/90 backdrop-blur-sm">
                {activeIndex + 1} / {images.length}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
