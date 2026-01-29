"use client";

import type { PlanDisplay } from "@/lib/plan-format";

type DeletePlanModalProps = {
  plan: PlanDisplay | null;
  onClose: () => void;
  onConfirm: (planId: string) => Promise<void>;
  pending: boolean;
};

export function DeletePlanModal({
  plan,
  onClose,
  onConfirm,
  pending,
}: DeletePlanModalProps) {
  if (!plan) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-plan-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h2 id="delete-plan-title" className="text-lg font-semibold text-white">
          Delete plan
        </h2>
        <p className="mt-2 text-sm text-zinc-400">
          Soft-delete &quot;{plan.name}&quot; ({plan.slug})? The plan will be
          hidden from pricing and cannot be purchased. Existing subscribers are
          unchanged.
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="flex-1 rounded-lg border border-zinc-600 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(plan.id)}
            disabled={pending}
            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
