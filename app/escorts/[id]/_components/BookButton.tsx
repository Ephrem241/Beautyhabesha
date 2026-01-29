"use client";

import { useState } from "react";
import { BookingModal } from "./BookingModal";

type BookButtonProps = {
  escortId: string;
  displayName: string;
  defaultDepositAmount?: number;
  isLoggedIn: boolean;
};

export function BookButton({
  escortId,
  displayName,
  defaultDepositAmount = 500,
  isLoggedIn,
}: BookButtonProps) {
  const [open, setOpen] = useState(false);

  if (!isLoggedIn) {
    return (
      <p className="mt-4 text-sm text-zinc-500">
        Sign in to request a booking.
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
      >
        Request booking
      </button>
      {open && (
        <BookingModal
          escortId={escortId}
          displayName={displayName}
          defaultDepositAmount={defaultDepositAmount}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
