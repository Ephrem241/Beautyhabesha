import Link from "next/link";

import { getAuthSession } from "@/lib/auth";
import { getUserPlan, hasFeatureAccess } from "@/lib/plan-access";

type DashboardPageProps = {
  searchParams: Promise<{
    payment?: string;
    profile?: string;
    subscription?: string;
  }>;
};

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps) {
  const params = await searchParams;
  const showSuccess = params.payment === "success";
  const showProfileUpdated = params.profile === "updated";
  const showSubscriptionPending = params.subscription === "pending";
  const session = await getAuthSession();
  const role = session?.user?.role;
  const plan = session?.user?.id ? await getUserPlan(session.user.id) : null;

  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        {showSuccess ? (
          <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Payment proof submitted. We will review and activate your plan soon.
          </div>
        ) : null}
        {showProfileUpdated ? (
          <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Profile updated successfully.
          </div>
        ) : null}
        {showSubscriptionPending ? (
          <div className="mt-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
            Subscription status: Pending Approval.
          </div>
        ) : null}
        <h1 className="mt-6 text-xl font-semibold sm:text-2xl">Dashboard</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Manage your profile, listings, and subscription status here.
        </p>

        <div className="mt-6 grid gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Link
            href="/pricing"
            className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
          >
            View plans
          </Link>
          {plan ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Current plan
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {plan.planId}
              </p>
              {plan.planId === "Normal" ? (
                <Link
                  href="/upgrade?plan=VIP"
                  className="mt-3 inline-flex text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300"
                >
                  Upgrade for more visibility
                </Link>
              ) : null}
              {!hasFeatureAccess(plan, "homepage_spotlight") ? (
                <p className="mt-3 text-xs text-zinc-500">
                  Homepage spotlight is locked. Upgrade to Platinum.
                </p>
              ) : null}
            </div>
          ) : null}
          {role === "escort" ? (
            <Link
              href="/escort/profile"
              className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
            >
              Edit escort profile
            </Link>
          ) : null}
          {role === "admin" ? (
            <>
              <Link
                href="/dashboard/admin/subscriptions"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Review subscriptions
              </Link>
              <Link
                href="/dashboard/admin/users"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Manage users
              </Link>
              <Link
                href="/dashboard/admin/escorts"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Manage escorts
              </Link>
              <Link
                href="/dashboard/admin/plans"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Manage plans
              </Link>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
