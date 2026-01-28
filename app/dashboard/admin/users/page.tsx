import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

import UsersTable from "./_components/UsersTable";

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminUsersPage() {
  await requireAdmin();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      currentPlan: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedUsers = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name ?? undefined,
    role: user.role as "admin" | "escort" | "user",
    currentPlan: (user.currentPlan as "Normal" | "VIP" | "Platinum" | null) ?? undefined,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Admin dashboard
          </p>
          <h1 className="text-3xl font-semibold">User Management</h1>
          <p className="text-sm text-zinc-400">
            View and manage user roles. Change a user&apos;s role by selecting from the dropdown.
          </p>
        </header>

        <UsersTable users={formattedUsers} />
      </div>
    </main>
  );
}
