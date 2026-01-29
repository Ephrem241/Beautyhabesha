import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { createOrUpdatePlan, deletePlan } from "./actions";

type PlanDoc = {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  priority: number;
};

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminPlansPage() {
  await requireAdmin();

  const plans = await prisma.plan.findMany({
    orderBy: { priority: "asc" },
  });

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Admin dashboard
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Manage Plans</h1>
          <p className="text-sm text-zinc-400">
            Create, update, or delete membership plans. Core plans (Normal, VIP, Platinum) cannot be deleted.
          </p>
        </header>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:mt-8 sm:rounded-3xl sm:p-6">
          <h2 className="text-base font-semibold text-white sm:text-lg">Create / Update plan</h2>
          <p className="mt-1 text-xs text-zinc-500">
            To update an existing plan, edit its values in the table below and click &quot;Save&quot;.
          </p>
          <form
            action={createOrUpdatePlan}
            className="mt-4 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4"
          >
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Name
              </label>
              <input
                name="name"
                type="text"
                required
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                placeholder="VIP"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Price (ETB)
              </label>
              <input
                name="price"
                type="number"
                min={0}
                step={1}
                required
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Duration (days)
              </label>
              <input
                name="durationDays"
                type="number"
                min={0}
                step={1}
                required
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Priority
              </label>
              <input
                name="priority"
                type="number"
                min={0}
                step={1}
                required
                className="mt-1 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-4">
              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-950 transition hover:bg-emerald-400"
              >
                Save plan
              </button>
            </div>
          </form>
        </section>

        <section className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200 sm:mt-8 sm:rounded-3xl sm:p-6">
          <h2 className="text-lg font-semibold text-white">Existing plans</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-zinc-800 bg-black">
            <table className="w-full min-w-[480px] text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-[0.15em] text-zinc-500">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-right">Price (ETB)</th>
                  <th className="px-4 py-3 text-right">Duration (days)</th>
                  <th className="px-4 py-3 text-right">Priority</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {plans.map((plan: PlanDoc) => {
                  const isCore = ["Normal", "VIP", "Platinum"].includes(plan.name);
                  return (
                    <tr key={plan.id}>
                      <td className="px-4 py-3">{plan.name}</td>
                      <td className="px-4 py-3 text-right">{plan.price}</td>
                      <td className="px-4 py-3 text-right">{plan.durationDays}</td>
                      <td className="px-4 py-3 text-right">{plan.priority}</td>
                      <td className="px-4 py-3 text-right">
                        <form action={deletePlan} className="inline">
                          <input type="hidden" name="id" value={plan.id} />
                          <button
                            type="submit"
                            disabled={isCore}
                            className="rounded-full border border-red-500/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:border-zinc-700 disabled:text-zinc-600"
                          >
                            Delete
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

