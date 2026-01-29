import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

import PaymentsTable from "./_components/PaymentsTable";

type PendingPayment = {
  id: string;
  userName?: string;
  userEmail?: string;
  planName: string;
  paymentMethod: string;
  submittedAt: string;
  proofUrl: string;
};

type SubscriptionWithUser = {
  id: string;
  planId: string;
  paymentMethod: string;
  paymentProofUrl: string;
  createdAt: Date;
  user: { name: string | null; email: string };
};

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminPaymentsPage() {
  await requireAdmin();

  const pendingPayments = await prisma.subscription.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  const payments: PendingPayment[] = pendingPayments.map((payment: SubscriptionWithUser) => ({
    id: payment.id,
    userName: payment.user.name ?? undefined,
    userEmail: payment.user.email,
    planName: payment.planId,
    paymentMethod: payment.paymentMethod,
    submittedAt: payment.createdAt.toLocaleString(),
    proofUrl: payment.paymentProofUrl,
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
            Review payment proofs and approve or reject subscription upgrades.
          </p>
        </header>

        <PaymentsTable payments={payments} />
      </div>
    </main>
  );
}
