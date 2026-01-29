import Link from "next/link";

import { getAuthSession, checkUserNotBanned } from "@/lib/auth";
import { getUserPlan, hasFeatureAccess } from "@/lib/plan-access";
import { getBookingsForUser, getBookingsForEscort } from "@/lib/booking";
import { prisma } from "@/lib/db";
import { getRenewalDashboardData } from "@/app/dashboard/actions";
import { AutoRenewSection } from "@/app/dashboard/_components/AutoRenewSection";
import { MyBookingsSection } from "@/app/dashboard/_components/MyBookingsSection";
import { EscortBookingsSection } from "@/app/dashboard/_components/EscortBookingsSection";

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
  const userId = session?.user?.id ?? null;
  if (userId) await checkUserNotBanned(userId);
  const plan = userId ? await getUserPlan(userId) : null;
  const renewalData =
    role === "escort" && userId ? await getRenewalDashboardData(userId) : null;
  const userBookings = userId ? await getBookingsForUser(userId) : [];
  const escortProfile =
    role === "escort" && userId
      ? await prisma.escortProfile.findUnique({
          where: { userId },
          select: { id: true },
        })
      : null;
  const escortBookings =
    escortProfile?.id ? await getBookingsForEscort(escortProfile.id) : [];

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
                  href="/payment-instructions?plan=vip"
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
            <>
              <Link
                href="/escort/profile"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Edit escort profile
              </Link>
              <Link
                href="/escort/availability"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Manage availability
              </Link>
            </>
          ) : null}
          {renewalData ? (
            <div className="sm:col-span-2 md:col-span-3">
              <AutoRenewSection data={renewalData} />
            </div>
          ) : null}
          {userBookings.length > 0 ? (
            <div className="sm:col-span-2 md:col-span-3">
              <MyBookingsSection bookings={userBookings} />
            </div>
          ) : null}
          {escortBookings.length > 0 ? (
            <div className="sm:col-span-2 md:col-span-3">
              <EscortBookingsSection bookings={escortBookings} />
            </div>
          ) : null}
          {role === "admin" ? (
            <>
              <Link
                href="/dashboard/admin/bookings"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Manage bookings
              </Link>
              <Link
                href="/dashboard/admin/subscriptions"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Review subscriptions
              </Link>
              <Link
                href="/dashboard/admin/payments"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Pending payments
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
                href="/dashboard/admin/escorts/create"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Create escort
              </Link>
              <Link
                href="/dashboard/admin/reports"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Profile reports
              </Link>
              <Link
                href="/dashboard/admin/consent"
                className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-4 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Consent history
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
