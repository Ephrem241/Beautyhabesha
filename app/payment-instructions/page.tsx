import { redirect } from "next/navigation";
import { getActiveSubscriptionPlans } from "@/lib/subscription-plans";

export default async function PaymentInstructionsPage() {
  const plans = await getActiveSubscriptionPlans();
  const firstPaidPlan = plans.find((p) => p.price > 0);
  if (firstPaidPlan) {
    redirect(`/payment-instructions/${firstPaidPlan.slug}`);
  }
  redirect("/pricing");
}
