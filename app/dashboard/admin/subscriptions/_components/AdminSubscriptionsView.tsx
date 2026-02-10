import { prisma } from "@/lib/db";
import { PLAN_CATALOG } from "@/lib/plans";

import PendingSubscriptionsTable from "./PendingSubscriptionsTable";

type PlanDoc = {
  name: string;
  price: number;
  durationDays: number;
};

type PlanInfo = {
  price: number;
  durationDays: number;
};

type SubscriptionWithUser = {
  id: string;
  userId: string;
  planId: string;
  paymentMethod: string;
  paymentProofUrl: string;
  paymentProofPublicId: string;
  createdAt: Date;
  user: { name: string | null; email: string | null; username: string | null };
};

type AdminSubscriptionsViewProps = {
  status?: string;
  error?: string;
};

function getStatusMessage(status?: string, error?: string) {
  if (status === "approved") {
    return { tone: "success", text: "Subscription approved and activated." };
  }
  if (status === "rejected") {
    return { tone: "warning", text: "Subscription rejected." };
  }
  if (error) {
    return {
      tone: "error",
      text: "Unable to process the request. Please try again.",
    };
  }
  return null;
}

export default async function AdminSubscriptionsView({
  status,
  error,
}: AdminSubscriptionsViewProps) {
  const subscriptions = await prisma.subscription.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true, username: true },
      },
    },
  });

  const planDocs = await prisma.plan.findMany();
  const planMap = new Map<string, PlanInfo>(
    planDocs.map((plan: PlanDoc) => [
      plan.name,
      { price: plan.price, durationDays: plan.durationDays },
    ])
  );
  const fallbackMap = new Map<string, PlanInfo>(
    PLAN_CATALOG.map((plan) => [
      plan.name,
      { price: plan.priceEtb, durationDays: plan.durationDays },
    ])
  );
  const statusMessage = getStatusMessage(status, error);

  return (
    <>
      <header className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
          Admin dashboard
        </p>
        <h1 className="text-2xl font-semibold sm:text-3xl">Pending subscriptions</h1>
        <p className="text-sm text-zinc-400">
          Review payment proofs, then approve or reject the requested plan.
        </p>
      </header>

      <div className="mt-6 sm:mt-8">
        <PendingSubscriptionsTable
          subscriptions={subscriptions.map((subscription: SubscriptionWithUser) => ({
            _id: subscription.id,
            userId: subscription.userId,
            userName: subscription.user.name ?? undefined,
            userEmail: subscription.user.email ?? subscription.user.username ?? "—",
            planId: subscription.planId,
            planPriceLabel: (() => {
              const plan =
                planMap.get(subscription.planId) ??
                fallbackMap.get(subscription.planId);
              if (!plan) return "ETB 0";
              return plan.price === 0 ? "Free" : `ETB ${plan.price}`;
            })(),
            planDurationLabel: (() => {
              const plan =
                planMap.get(subscription.planId) ??
                fallbackMap.get(subscription.planId);
              if (!plan) return "No expiry";
              return plan.durationDays === 0
                ? "No expiry"
                : `${plan.durationDays} days`;
            })(),
            paymentMethod: subscription.paymentMethod,
            paymentProof: {
              url: subscription.paymentProofUrl,
              publicId: subscription.paymentProofPublicId,
            },
            createdAt: subscription.createdAt,
          }))}
        />
      </div>

      {statusMessage ? (
        <div
          className={`mt-6 rounded-2xl border px-4 py-3 text-sm ${
            statusMessage.tone === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : statusMessage.tone === "warning"
              ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          {statusMessage.text}
        </div>
      ) : null}
    </>
  );
}

