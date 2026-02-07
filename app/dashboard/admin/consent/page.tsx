import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TableSkeleton } from "@/app/_components/ui/TableSkeleton";

const ConsentHistoryTable = nextDynamic(() => import("./_components/ConsentHistoryTable"), {
  loading: () => <TableSkeleton rows={8} cols={5} />,
});

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminConsentPage() {
  // Opt into dynamic rendering for admin dashboard
  unstable_noStore();

  await requireAdmin();

  const records = await prisma.consentRecord.findMany({
    include: {
      user: { select: { id: true, email: true, username: true, name: true, role: true } },
    },
    orderBy: { acceptedAt: "desc" },
    take: 500,
  });

  const formatted = records.map((r) => ({
    id: r.id,
    userId: r.userId,
    userEmail: r.user.email ?? r.user.username ?? "—",
    userName: r.user.name ?? null,
    userRole: r.user.role,
    type: r.type,
    version: r.version,
    acceptedAt: r.acceptedAt.toISOString(),
    ip: r.ip ?? null,
  }));

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Legal &amp; compliance
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Consent history
          </h1>
          <p className="text-sm text-zinc-400">
            View when users accepted terms, content agreement, 21+, and
            ownership.
          </p>
        </header>

        <ConsentHistoryTable records={formatted} />
      </div>
    </main>
  );
}
