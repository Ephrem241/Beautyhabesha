"use client";

import { useFormState } from "react-dom";

import { submitPaymentProof, type PaymentFormState } from "../actions";

type PaymentFormProps = {
  planId: "Normal" | "VIP" | "Platinum";
};

const initialState: PaymentFormState = {};

export default function PaymentForm({ planId }: PaymentFormProps) {
  const [state, formAction] = useFormState(submitPaymentProof, initialState);

  return (
    <form
      action={formAction}
      className="mt-8 rounded-2xl border border-zinc-800 bg-black p-6"
    >
      <input type="hidden" name="planId" value={planId} />
      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-zinc-200">
          Payment method
        </legend>
        <div className="mt-3 flex flex-col gap-3 text-sm text-zinc-300">
          <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
            <input
              type="radio"
              name="paymentMethod"
              value="bank"
              required
              className="h-4 w-4 accent-emerald-400"
            />
            <span>Bank transfer</span>
          </label>
          <label className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
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
      <p className="mt-1 text-xs text-zinc-500">
        JPG or PNG. Max 5MB.
      </p>
      <input
        type="file"
        name="proof"
        accept="image/*"
        required
        className="mt-4 block w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-950 hover:file:bg-emerald-300"
      />

      {state.error ? (
        <p className="mt-4 text-sm text-red-400">{state.error}</p>
      ) : null}

      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
      >
        Submit payment proof
      </button>
    </form>
  );
}
