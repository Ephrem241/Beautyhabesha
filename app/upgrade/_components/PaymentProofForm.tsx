"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import Image from "next/image";

import { Button } from "@/app/_components/ui/Button";

import { submitUpgradePayment, type UpgradeFormState } from "../actions";

type PaymentProofFormProps = {
  planId: "Normal" | "VIP" | "Platinum";
};

const initialState: UpgradeFormState = {};

export default function PaymentProofForm({ planId }: PaymentProofFormProps) {
  const [state, formAction] = useFormState(
    submitUpgradePayment,
    initialState
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <form
      action={formAction}
      className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:rounded-3xl sm:p-6"
    >
      <input type="hidden" name="planId" value={planId} />

      <fieldset>
        <legend className="text-sm font-semibold text-zinc-200">
          Payment method
        </legend>
        <div className="mt-3 flex flex-col gap-3 text-sm text-zinc-300">
          <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black px-4 py-3">
            <input
              type="radio"
              name="paymentMethod"
              value="bank"
              required
              className="h-4 w-4 accent-emerald-400"
            />
            <span>Bank transfer</span>
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-zinc-800 bg-black px-4 py-3">
            <input
              type="radio"
              name="paymentMethod"
              value="mobile_money"
              required
              className="h-4 w-4 accent-emerald-400"
            />
            <span>Mobile money</span>
          </label>
        </div>
      </fieldset>

      <label className="mt-6 block text-sm font-semibold text-zinc-200">
        Upload payment proof
      </label>
      <p id="payment-proof-hint" className="mt-1 text-xs text-zinc-500">
        JPG or PNG. Max 5MB.
      </p>
      <input
        type="file"
        name="proof"
        accept="image/*"
        required
        aria-describedby={
          state.error ? "payment-proof-hint payment-proof-error" : "payment-proof-hint"
        }
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const url = URL.createObjectURL(file);
          setPreviewUrl(url);
        }}
        className="mt-4 block w-full cursor-pointer rounded-2xl border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-200 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-950 hover:file:bg-emerald-300"
      />

      {previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-800">
          <div className="relative h-48 w-full">
            <Image
              src={previewUrl}
              alt="Payment proof preview"
              fill
              className="object-cover"
            />
          </div>
        </div>
      ) : null}

      {state.error ? (
        <p
          id="payment-proof-error"
          role="alert"
          aria-live="polite"
          className="mt-4 text-sm text-red-400"
        >
          {state.error}
        </p>
      ) : null}

      <Button type="submit" fullWidth size="md" className="mt-6">
        Submit payment proof
      </Button>
    </form>
  );
}
