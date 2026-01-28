"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";
import Image from "next/image";

type PreviewModalProps = {
  imageUrl: string | null;
  onClose: () => void;
};

export default function PreviewModal({ imageUrl, onClose }: PreviewModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (imageUrl) {
      closeRef.current?.focus();
    }
  }, [imageUrl]);

  return (
    <AnimatePresence>
      {imageUrl ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6"
          role="dialog"
          aria-modal="true"
          aria-label="Payment proof preview"
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
          }}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <motion.div
            className="relative w-full max-w-3xl rounded-3xl border border-zinc-800 bg-zinc-950 p-4"
            onClick={(event) => event.stopPropagation()}
            initial={{ y: prefersReducedMotion ? 0 : 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: prefersReducedMotion ? 0 : 12, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="absolute right-4 top-4 rounded-full border border-zinc-700 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              Close
            </button>
            <div className="relative h-[70vh] w-full">
              <Image
                src={imageUrl}
                alt="Payment proof"
                fill
                className="rounded-2xl object-contain"
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
