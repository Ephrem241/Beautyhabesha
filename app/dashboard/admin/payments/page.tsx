import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";

import { getAuthSession } from "@/lib/auth";
import { listPaymentsCursor, listSubscriptionsCursor } from "@/lib/admin-cursor";
import { TableSkeleton } from "@/app/_components/ui/TableSkeleton";

const PaymentRecordsTable = nextDynamic(() => import("./_components/PaymentRecordsTable").then((m) => m.PaymentRecordsTable), {
  loading: () => <TableSkeleton rows={5} cols={6} />,
});
const SubscriptionPaymentsTable = nextDynamic(() => import("./_components/SubscriptionPaymentsTable").then((m) => m.SubscriptionPaymentsTable), {
  loading: () => <TableSkeleton rows={5} cols={6} />,
});

type PendingPaymentRecord = {
  id: string;
  userName?: string;
  userEmail?: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  submittedAt: string;
  proofUrl: string;
};

type SubscriptionPayment = {
  id: string;
  userName?: string;
  userEmail?: string;
  planName: string;
  paymentMethod: string;
  submittedAt: string;
  proofUrl: string;
};

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminPaymentsPage() {
  // Opt into dynamic rendering for admin dashboard
  unstable_noStore();

  await requireAdmin();

  const [paymentsResult, subscriptionsResult] = await Promise.all([
    listPaymentsCursor({ status: "pending", take: 100 }),
    listSubscriptionsCursor({ status: "pending", take: 100 }),
  ]);

  const payments: PendingPaymentRecord[] = paymentsResult.items.map((p) => ({
    id: p.id,
    userName: p.user.name ?? undefined,
    userEmail: p.user.email ?? p.user.username ?? "—",
    planName: p.plan.name,
    amount: p.amount,
    paymentMethod: p.paymentMethod,
    submittedAt: p.createdAt.toLocaleString(),
    proofUrl: p.receiptUrl,
  }));

  const subscriptions: SubscriptionPayment[] = subscriptionsResult.items.map((s) => ({
    id: s.id,
    userName: s.user.name ?? undefined,
    userEmail: s.user.email ?? s.user.username ?? "—",
    planName: s.subscriptionPlan?.name ?? s.planId,
    paymentMethod: s.paymentMethod,
    submittedAt: s.createdAt.toLocaleString(),
    proofUrl: s.paymentProofUrl,
  }));

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Admin dashboard
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Pending payments</h1>
          <p className="text-sm text-zinc-400">
            Review payment proofs and approve or reject subscriptions.
          </p>
        </header>

        {payments.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-semibold text-zinc-200">
              Pay-first payments
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              New users who paid first and uploaded proof.
            </p>
            <PaymentRecordsTable payments={payments} />
          </section>
        )}

        {subscriptions.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-semibold text-zinc-200">
              Subscription upgrades
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Existing users upgrading their plan.
            </p>
            <SubscriptionPaymentsTable payments={subscriptions} />
          </section>
        )}

        {payments.length === 0 && subscriptions.length === 0 && (
          <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-500">
            No pending payments.
          </div>
        )}
      </div>
    </main>
  );
}
