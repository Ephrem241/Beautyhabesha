import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getActiveSubscriptionPlans } from "@/lib/subscription-plans";

export default async function PaymentInstructionsPage() {
  // Access request data first to make this route dynamic and avoid prerender timing issues
  await headers();

  const plans = await getActiveSubscriptionPlans();
  const firstPaidPlan = plans.find((p) => p.price > 0);
  if (firstPaidPlan) {
    redirect(`/payment-instructions/${firstPaidPlan.slug}`);
  }
  redirect("/pricing");
}
