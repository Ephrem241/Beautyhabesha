"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/app/_components/ui/Button";

type RejectModalProps = {
  subscriptionId: string | null;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  isPending: boolean;
};

export default function RejectModal({
  subscriptionId,
  onClose,
  onConfirm,
  isPending,
}: RejectModalProps) {
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [reason, setReason] = useState("");
  const prefersReducedMotion = useReducedMotion();

  const handleClose = () => {
    setReason("");
    onClose();
  };

  useEffect(() => {
    if (subscriptionId) {
      closeRef.current?.focus();
    }
  }, [subscriptionId]);

  return (
    <AnimatePresence>
      {subscriptionId ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Reject payment"
          onKeyDown={(event) => {
            if (event.key === "Escape") handleClose();
          }}
          onClick={handleClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
        >
          <motion.div
            className="w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
            onClick={(event) => event.stopPropagation()}
            initial={{ y: prefersReducedMotion ? 0 : 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: prefersReducedMotion ? 0 : 12, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-white sm:text-lg">
                Reject payment request
              </h2>
              <Button
                ref={closeRef}
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
            <p className="mt-3 text-sm text-zinc-400">
              Add an optional reason to help the user resolve the issue.
            </p>
            <label className="mt-4 flex flex-col gap-2 text-sm text-zinc-200">
              Rejection reason (optional)
              <textarea
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                rows={4}
                className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white"
              />
            </label>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button
                type="button"
                onClick={() => onConfirm(reason.trim() || undefined)}
                disabled={isPending}
              >
                {isPending ? "Working..." : "Confirm rejection"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
