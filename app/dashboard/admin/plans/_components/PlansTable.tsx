"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  togglePlanFlag,
  deletePlan,
  type PlanActionResult,
} from "../actions";
import { formatPrice, formatDurationDays, type PlanDisplay } from "@/lib/plan-format";
import { PlanForm } from "./PlanForm";
import { DeletePlanModal } from "./DeletePlanModal";

type PlansTableProps = {
  plans: PlanDisplay[];
};

export function PlansTable({ plans: initialPlans }: PlansTableProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [result, setResult] = useState<PlanActionResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<PlanDisplay | null>(null);
  const [editTarget, setEditTarget] = useState<PlanDisplay | null>(null);
  const router = useRouter();

  const refresh = () => router.refresh();

  const handleToggle = (planId: string, flag: "isActive" | "isPopular" | "isRecommended") => {
    setResult(null);
    startTransition(async () => {
      const r = await togglePlanFlag(planId, flag);
      setResult(r);
      if (r.ok) {
        setPlans((prev) =>
          prev.map((p) => {
            if (p.id !== planId) return p;
            const key = flag as keyof PlanDisplay;
            const next = !(p[key] as boolean);
            return { ...p, [key]: next };
          })
        );
      }
    });
  };

  const handleDeleteConfirm = async (planId: string) => {
    setResult(null);
    startTransition(async () => {
      const r = await deletePlan(planId);
      setResult(r);
      if (r.ok) {
        setDeleteTarget(null);
        setPlans((prev) => prev.filter((p) => p.id !== planId));
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

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-500">
                <th className="px-4 py-3">Name / Slug</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Badges</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {plans.map((plan) => (
                <tr key={plan.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{plan.name}</p>
                    <p className="text-xs text-zinc-500">{plan.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {formatPrice(plan)}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {formatDurationDays(plan.durationDays)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <label className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={plan.isActive}
                          onChange={() => handleToggle(plan.id, "isActive")}
                          disabled={pending}
                          className="rounded border-zinc-600"
                        />
                        <span className="text-xs">Active</span>
                      </label>
                      <label className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={plan.isPopular}
                          onChange={() => handleToggle(plan.id, "isPopular")}
                          disabled={pending}
                          className="rounded border-zinc-600"
                        />
                        <span className="text-xs">Popular</span>
                      </label>
                      <label className="flex items-center gap-1.5">
                        <input
                          type="checkbox"
                          checked={plan.isRecommended}
                          onChange={() => handleToggle(plan.id, "isRecommended")}
                          disabled={pending}
                          className="rounded border-zinc-600"
                        />
                        <span className="text-xs">Recommended</span>
                      </label>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditTarget(plan)}
                        className="rounded-lg border border-zinc-600 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(plan)}
                        className="rounded-lg border border-red-500/50 px-2 py-1 text-xs text-red-300 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-plan-title"
        >
          <div className="my-8 w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center justify-between">
              <h2 id="edit-plan-title" className="text-lg font-semibold text-white">
                Edit plan
              </h2>
              <button
                type="button"
                onClick={() => setEditTarget(null)}
                className="rounded-lg border border-zinc-600 px-3 py-1 text-sm text-zinc-400 hover:bg-zinc-800"
              >
                Close
              </button>
            </div>
            <div className="mt-4">
              <PlanForm
                plan={editTarget}
                onSuccess={() => {
                  setEditTarget(null);
                  refresh();
                }}
              />
            </div>
          </div>
        </div>
      )}

      <DeletePlanModal
        plan={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        pending={pending}
      />
    </>
  );
}
