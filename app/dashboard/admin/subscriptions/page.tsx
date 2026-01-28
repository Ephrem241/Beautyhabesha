import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";

import AdminSubscriptionsView from "@/app/admin/subscriptions/AdminSubscriptionsView";

type AdminSubscriptionsPageProps = {
  searchParams?: {
    status?: string;
    error?: string;
  };
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

  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <AdminSubscriptionsView
          status={searchParams?.status}
          error={searchParams?.error}
        />
      </div>
    </main>
  );
}
