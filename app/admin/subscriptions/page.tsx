import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { AdminPlansSection } from "@/app/_components/admin/AdminPlansSection";

import AdminSubscriptionsView from "./AdminSubscriptionsView";

type AdminSubscriptionsPageProps = {
  searchParams?: Promise<{ tab?: string; status?: string; error?: string }>;
};

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminSubscriptionsPage({
  searchParams,
}: AdminSubscriptionsPageProps) {
  await requireAdmin();
  const params = searchParams ? await searchParams : {};
  const tab = params?.tab === "plans" ? "plans" : "pending";

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <nav
          className="mb-6 flex gap-1 border-b border-zinc-800 sm:mb-8"
          aria-label="Subscriptions tabs"
        >
          <Link
            href="/admin/subscriptions?tab=pending"
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:px-5 ${
              tab === "pending"
                ? "border-emerald-500 text-emerald-300"
                : "border-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            }`}
          >
            Pending
          </Link>
          <Link
            href="/admin/subscriptions?tab=plans"
            className={`border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:px-5 ${
              tab === "plans"
                ? "border-emerald-500 text-emerald-300"
                : "border-transparent text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
            }`}
          >
            Manage plans
          </Link>
        </nav>

        {tab === "plans" ? (
          <AdminPlansSection embedded />
        ) : (
          <AdminSubscriptionsView
            status={params?.status}
            error={params?.error}
          />
        )}
      </div>
    </main>
  );
}
