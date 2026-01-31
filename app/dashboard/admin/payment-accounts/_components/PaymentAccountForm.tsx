"use client";

import { useActionState, useState } from "react";
import {
  createPaymentAccount,
  updatePaymentAccount,
  type PaymentAccountActionResult,
} from "../actions";
import type { PaymentAccountDoc } from "@/lib/payment-accounts";

type PaymentAccountFormProps = {
  account?: PaymentAccountDoc | null;
  onSuccess?: () => void;
};

export function PaymentAccountForm({ account, onSuccess }: PaymentAccountFormProps) {
  const [state, formAction] = useActionState<PaymentAccountActionResult, FormData>(
    account ? updatePaymentAccount : createPaymentAccount,
    { ok: false }
  );
  const [showForm, setShowForm] = useState(!account);
  const [type, setType] = useState<"bank" | "mobile_money">(
    (account?.type as "bank" | "mobile_money") ?? "bank"
  );

  if (state?.ok && onSuccess) {
    onSuccess();
    return null;
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {account ? "Edit payment account" : "Create payment account"}
        </h2>
        {account && (
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300"
          >
            {showForm ? "Collapse" : "Expand"}
          </button>
        )}
      </div>

      {(!account || showForm) && (
        <form action={formAction} className="mt-4 space-y-4">
          {state?.error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {state.error}
            </div>
          )}
          {account && <input type="hidden" name="id" value={account.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Type
              </label>
              <select
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as "bank" | "mobile_money")}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="bank">Bank transfer</option>
                <option value="mobile_money">Mobile money</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Display order
              </label>
              <input
                name="displayOrder"
                type="number"
                min={0}
                defaultValue={account?.displayOrder ?? 0}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
              />
              <p className="mt-1 text-xs text-zinc-500">Lower = shown first.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Account name
            </label>
            <input
              name="accountName"
              type="text"
              required
              defaultValue={account?.accountName}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
              placeholder="Abenezer z"
            />
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Account number
            </label>
            <input
              name="accountNumber"
              type="text"
              required
              defaultValue={account?.accountNumber}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
              placeholder="1000510638798 or 0912 696 090"
            />
          </div>

          {type === "mobile_money" && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Provider
              </label>
              <input
                name="provider"
                type="text"
                defaultValue={account?.provider ?? ""}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                placeholder="TeleBirr"
              />
            </div>
          )}
          {type === "bank" && <input type="hidden" name="provider" value="" />}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              id="pa-isActive"
              defaultChecked={account?.isActive ?? true}
              className="rounded border-zinc-600"
            />
            <label htmlFor="pa-isActive" className="text-sm text-zinc-300">
              Active (shown on payment instructions)
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400"
            >
              {account ? "Update" : "Create"}
            </button>
            {account && (
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-full border border-zinc-600 px-4 py-2 text-sm text-zinc-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </section>
  );
}
