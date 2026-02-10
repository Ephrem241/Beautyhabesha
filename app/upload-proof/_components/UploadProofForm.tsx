"use client";

import { useActionState } from "react";
import { submitPaymentProof, type UploadProofState } from "../actions";

type UploadProofFormProps = {
  planSlug: string;
  planId: string;
};

const initialState: UploadProofState = {};

export function UploadProofForm({
  planSlug,
  planId,
}: UploadProofFormProps) {
  const [state, formAction] = useActionState(submitPaymentProof, initialState);

  return (
    <form
      action={formAction}
      className="mt-6 rounded-2xl border border-zinc-800 bg-black p-4 sm:p-6"
    >
      <input type="hidden" name="planSlug" value={planSlug} />
      <input type="hidden" name="planId" value={planId} />

      <fieldset>
        <legend className="text-sm font-semibold text-zinc-200">
          Payment method used
        </legend>
        <div className="mt-3 flex flex-col gap-3 text-sm text-zinc-300">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 transition hover:border-zinc-700">
            <input
              type="radio"
              name="paymentMethod"
              value="telebirr"
              required
              className="h-4 w-4 accent-emerald-400"
            />
            <span>TeleBirr</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 transition hover:border-zinc-700">
            <input
              type="radio"
              name="paymentMethod"
              value="cbe"
              className="h-4 w-4 accent-emerald-400"
            />
            <span>CBE (Commercial Bank of Ethiopia)</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 transition hover:border-zinc-700">
            <input
              type="radio"
              name="paymentMethod"
              value="bank"
              className="h-4 w-4 accent-emerald-400"
            />
            <span>Bank transfer</span>
          </label>
        </div>
      </fieldset>

      <label className="mt-6 block text-sm font-semibold text-zinc-200">
        Upload receipt
      </label>
      <p className="mt-1 text-xs text-zinc-500">JPG or PNG. Max 5MB.</p>
      <input
        type="file"
        name="proof"
        accept="image/*"
        required
        className="mt-4 block w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-950 hover:file:bg-emerald-300"
      />

      {state.error && (
        <p className="mt-4 text-sm text-red-400">{state.error}</p>
      )}

      <p className="mt-4 text-xs text-zinc-500">
        Choose your receipt image above. When you submit, we&apos;ll ask you to sign in or sign up if needed.
      </p>
      <button
        type="submit"
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-950 transition hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:opacity-50"
      >
        Submit payment proof
      </button>
    </form>
  );
}
