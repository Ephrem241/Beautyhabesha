import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

import { PaymentRecordsTable } from "./_components/PaymentRecordsTable";
import { SubscriptionPaymentsTable } from "./_components/SubscriptionPaymentsTable";

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
  await requireAdmin();

  const [paymentRecords, subscriptionPayments] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true, username: true },
        },
        plan: { select: { name: true } },
      },
    }),
    prisma.subscription.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true, username: true },
        },
      },
    }),
  ]);

  const payments: PendingPaymentRecord[] = paymentRecords.map((p) => ({
    id: p.id,
    userName: p.user.name ?? undefined,
    userEmail: p.user.email ?? p.user.username ?? "—",
    planName: p.plan.name,
    amount: p.amount,
    paymentMethod: p.paymentMethod,
    submittedAt: p.createdAt.toLocaleString(),
    proofUrl: p.receiptUrl,
  }));

  const subscriptions: SubscriptionPayment[] = subscriptionPayments.map((s) => ({
    id: s.id,
    userName: s.user.name ?? undefined,
    userEmail: s.user.email ?? s.user.username ?? "—",
    planName: s.planId,
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
