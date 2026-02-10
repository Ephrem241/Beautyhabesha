import { redirect } from "next/navigation";

export default function AdminSubscriptionsRedirect() {
  redirect("/dashboard/admin/subscriptions");
}
