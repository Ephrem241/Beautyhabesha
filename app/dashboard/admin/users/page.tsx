import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { listUsersCursor } from "@/lib/admin-cursor";
import { TableSkeleton } from "@/app/_components/ui/TableSkeleton";

const UsersTable = nextDynamic(() => import("./_components/UsersTable"), {
  loading: () => <TableSkeleton rows={8} cols={5} />,
});

type UserRow = {
  id: string;
  email: string | null;
  username: string | null;
  name: string | null;
  role: string;
  currentPlan: string | null;
  autoRenew: boolean;
  renewalAttempts: number;
  lastRenewalAttempt: Date | null;
  bannedAt: Date | null;
  createdAt: Date;
};

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminUsersPage() {
  await requireAdmin();

  const { items: users } = await listUsersCursor({ take: 50 });

  const formattedUsers = users.map((user: UserRow) => ({
    id: user.id,
    email: user.email ?? user.username ?? "—",
    name: user.name ?? undefined,
    role: user.role as "admin" | "escort" | "user",
    currentPlan: (user.currentPlan as "Normal" | "VIP" | "Platinum" | null) ?? undefined,
    autoRenew: user.autoRenew,
    renewalAttempts: user.renewalAttempts,
    lastRenewalAttempt: user.lastRenewalAttempt?.toISOString() ?? undefined,
    bannedAt: user.bannedAt?.toISOString() ?? undefined,
    createdAt: user.createdAt.toISOString(),
  }));

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Admin dashboard
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">User Management</h1>
          <p className="text-sm text-zinc-400">
            View and manage user roles. Change a user&apos;s role by selecting from the dropdown.
          </p>
        </header>

        <UsersTable users={formattedUsers} />
      </div>
    </main>
  );
}
