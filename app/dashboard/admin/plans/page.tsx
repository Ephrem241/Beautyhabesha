import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";

import { getAuthSession } from "@/lib/auth";
import { TableSkeleton } from "@/app/_components/ui/TableSkeleton";

const AdminPlansSection = nextDynamic(
  () => import("@/app/_components/admin/AdminPlansSection").then((m) => m.AdminPlansSection),
  { loading: () => <TableSkeleton rows={5} cols={5} /> }
);

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminPlansPage() {
  // Opt into dynamic rendering for admin dashboard
  unstable_noStore();

  await requireAdmin();

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <AdminPlansSection />
      </div>
    </main>
  );
}
