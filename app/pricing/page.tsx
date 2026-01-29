import type { Metadata } from "next";
import { cookies } from "next/headers";

import { getEffectivePlanCatalog } from "@/lib/plans";

import PlanCard from "./_components/PlanCard";
import PricingHeader from "./_components/PricingHeader";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Compare Normal, VIP, and Platinum membership plans.",
};

async function getIsLoggedIn() {
  const store = await cookies();
  return (
    store.has("next-auth.session-token") ||
    store.has("__Secure-next-auth.session-token")
  );
}

export default async function PricingPage() {
  const isLoggedIn = await getIsLoggedIn();
  const plans = await getEffectivePlanCatalog();

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <PricingHeader />

        <div className="mt-8 grid gap-4 sm:mt-12 sm:gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} isLoggedIn={isLoggedIn} />
          ))}
        </div>
      </div>
    </main>
  );
}
