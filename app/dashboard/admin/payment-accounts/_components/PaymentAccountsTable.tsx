"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deletePaymentAccount,
  togglePaymentAccountActive,
  type PaymentAccountActionResult,
} from "../actions";
import type { PaymentAccountDoc } from "@/lib/payment-accounts";
import { PaymentAccountForm } from "./PaymentAccountForm";

type PaymentAccountsTableProps = {
  accounts: PaymentAccountDoc[];
};

export function PaymentAccountsTable({ accounts: initialAccounts }: PaymentAccountsTableProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [result, setResult] = useState<PaymentAccountActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<PaymentAccountDoc | null>(null);
  const [editTarget, setEditTarget] = useState<PaymentAccountDoc | null>(null);
  const router = useRouter();

  const refresh = () => {
    setTimeout(() => router.refresh(), 0);
  };

  const handleToggleActive = (id: string) => {
    setResult(null);
    startTransition(async () => {
      const r = await togglePaymentAccountActive(id);
      setResult(r);
      if (r.ok) {
        setAccounts((prev) =>
          prev.map((a) => (a.id !== id ? a : { ...a, isActive: !a.isActive }))
        );
      }
    });
  };

  const handleDeleteConfirm = async (id: string) => {
    setResult(null);
    startTransition(async () => {
      const r = await deletePaymentAccount(id);
      setResult(r);
      if (r.ok) {
        setDeleteTarget(null);
        setEditTarget((e) => (e?.id === id ? null : e));
        setAccounts((prev) => prev.filter((a) => a.id !== id));
      }
    });
  };

  return (
    <>
      {result && !result.ok && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {result.error}
        </div>
      )}

      {editTarget && (
        <div className="mb-6">
          <PaymentAccountForm
            key={editTarget.id}
            account={editTarget}
            onSuccess={() => {
              setEditTarget(null);
              refresh();
            }}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Account name</th>
                <th className="px-4 py-3">Account number</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {accounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <span
                      className={
                        acc.type === "bank"
                          ? "rounded bg-zinc-700 px-2 py-0.5 text-xs text-zinc-200"
                          : "rounded bg-emerald-950/50 px-2 py-0.5 text-xs text-emerald-300"
                      }
                    >
                      {acc.type === "bank" ? "Bank" : "Mobile money"}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{acc.accountName}</td>
                  <td className="px-4 py-3 text-zinc-300">{acc.accountNumber}</td>
                  <td className="px-4 py-3 text-zinc-400">{acc.provider ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-400">{acc.displayOrder}</td>
                  <td className="px-4 py-3">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={acc.isActive}
                        onChange={() => handleToggleActive(acc.id)}
                        disabled={pending}
                        className="rounded border-zinc-600"
                      />
                      <span className="text-zinc-400">{acc.isActive ? "Yes" : "No"}</span>
                    </label>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setEditTarget(acc)}
                      className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(acc)}
                      className="ml-2 rounded-lg border border-red-500/50 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/10"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {accounts.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-zinc-500">
            No payment accounts yet. Create one above.
          </div>
        )}
      </div>

      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div className="mx-4 w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <h2 id="delete-title" className="text-lg font-semibold text-white">
              Delete payment account?
            </h2>
            <p className="mt-2 text-sm text-zinc-400">
              {deleteTarget.accountName} · {deleteTarget.accountNumber}. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => handleDeleteConfirm(deleteTarget.id)}
                disabled={pending}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={pending}
                className="rounded-full border border-zinc-600 px-4 py-2 text-sm text-zinc-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
