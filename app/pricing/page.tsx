import type { Metadata } from "next";

import { getActiveSubscriptionPlans } from "@/lib/subscription-plans";

import PlanCard from "./_components/PlanCard";
import PricingHeader from "./_components/PricingHeader";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Pricing",
  description: "Compare Normal, VIP, and Platinum membership plans.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Pricing • Beautyhabesha",
    description: "Compare Normal, VIP, and Platinum membership plans.",
    type: "website",
    url: "/pricing",
  },
  twitter: { card: "summary_large_image", title: "Pricing • Beautyhabesha" },
};

export default async function PricingPage() {
  const plans = await getActiveSubscriptionPlans();

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <PricingHeader />

        <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {plans.length === 0 ? (
            <p className="col-span-full text-center text-sm text-zinc-500">
              No active plans at the moment. Check back later.
            </p>
          ) : (
            plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
