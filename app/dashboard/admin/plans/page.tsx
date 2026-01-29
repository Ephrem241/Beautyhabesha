import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { AdminPlansSection } from "@/app/_components/admin/AdminPlansSection";

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminPlansPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <AdminPlansSection />
      </div>
    </main>
  );
}
