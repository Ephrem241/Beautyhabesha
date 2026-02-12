import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";

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

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

type PageProps = { searchParams: Promise<{ cursor?: string }> };

export default async function AdminUsersPage({ searchParams }: PageProps) {
  // Opt into dynamic rendering for admin dashboard
  unstable_noStore();

  await requireAdmin();

  const params = await searchParams;
  const cursor = params.cursor ?? undefined;

  const { items: users, nextCursor } = await listUsersCursor({ cursor, take: 50 });

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

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          {cursor && (
            <a
              href="/dashboard/admin/users"
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              ← Back to first
            </a>
          )}
          {nextCursor && (
            <a
              href={`/dashboard/admin/users?cursor=${encodeURIComponent(nextCursor)}`}
              className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-emerald-300 transition hover:bg-emerald-500/20"
            >
              Next page →
            </a>
          )}
          {!cursor && !nextCursor && users.length > 0 && (
            <span className="text-zinc-500">Showing first {users.length} users</span>
          )}
        </div>
      </div>
    </main>
  );
}
