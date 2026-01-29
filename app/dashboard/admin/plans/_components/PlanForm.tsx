"use client";

import { useActionState, useState } from "react";
import { createPlan, updatePlan, type PlanActionResult } from "../actions";
import type { PlanDisplay } from "@/lib/plan-format";

type PlanFormProps = {
  plan?: PlanDisplay | null;
  onSuccess?: () => void;
};

export function PlanForm({ plan, onSuccess }: PlanFormProps) {
  const [state, formAction] = useActionState<PlanActionResult, FormData>(
    plan ? updatePlan : createPlan,
    { ok: false }
  );
  const [showForm, setShowForm] = useState(!plan);

  if (state?.ok && onSuccess) {
    onSuccess();
    return null;
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          {plan ? "Edit plan" : "Create plan"}
        </h2>
        {plan && (
          <button
            type="button"
            onClick={() => setShowForm((s) => !s)}
            className="rounded-lg border border-zinc-600 px-3 py-1.5 text-sm text-zinc-300"
          >
            {showForm ? "Collapse" : "Expand"}
          </button>
        )}
      </div>

      {(!plan || showForm) && (
        <form action={formAction} className="mt-4 space-y-4">
          {state?.error && (
            <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {state.error}
            </div>
          )}
          {plan && <input type="hidden" name="id" value={plan.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Name
              </label>
              <input
                name="name"
                type="text"
                required
                defaultValue={plan?.name}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                placeholder="VIP Yearly"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Slug
              </label>
              <input
                name="slug"
                type="text"
                required
                defaultValue={plan?.slug}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
                placeholder="vip_yearly"
              />
              <p className="mt-1 text-xs text-zinc-500">
                Lowercase, numbers, underscores only. Spaces and hyphens are converted to underscores.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Price
              </label>
              <input
                name="price"
                type="number"
                min={0}
                step={0.01}
                required
                defaultValue={plan?.price}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Currency
              </label>
              <input
                name="currency"
                type="text"
                defaultValue={plan?.currency ?? "ETB"}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Billing cycle
              </label>
              <select
                name="billingCycle"
                defaultValue={plan?.billingCycle ?? "monthly"}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
                Duration (days)
              </label>
              <input
                name="durationDays"
                type="number"
                min={0}
                required
                defaultValue={plan?.durationDays ?? 30}
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
              Features (one per line)
            </label>
            <textarea
              name="features"
              rows={5}
              defaultValue={plan?.features?.join("\n") ?? ""}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
              placeholder="view_models&#10;private_gallery&#10;direct_message"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input type="hidden" name="isActive" value="off" />
              <input
                type="checkbox"
                name="isActive"
                defaultChecked={plan?.isActive ?? true}
                value="on"
                className="rounded border-zinc-600"
              />
              <span className="text-sm text-zinc-300">Active</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="hidden" name="isPopular" value="off" />
              <input
                type="checkbox"
                name="isPopular"
                defaultChecked={plan?.isPopular ?? false}
                value="on"
                className="rounded border-zinc-600"
              />
              <span className="text-sm text-zinc-300">Popular</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="hidden" name="isRecommended" value="off" />
              <input
                type="checkbox"
                name="isRecommended"
                defaultChecked={plan?.isRecommended ?? false}
                value="on"
                className="rounded border-zinc-600"
              />
              <span className="text-sm text-zinc-300">Recommended</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
            >
              {plan ? "Save changes" : "Create plan"}
            </button>
            {plan && (
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
