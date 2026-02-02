import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TableSkeleton } from "@/app/_components/ui/TableSkeleton";

const ReportsTable = dynamic(() => import("./_components/ReportsTable"), {
  loading: () => <TableSkeleton rows={6} cols={5} />,
});

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminReportsPage() {
  await requireAdmin();

  const reports = await prisma.report.findMany({
    include: {
      escortProfile: { select: { id: true, displayName: true, userId: true } },
      reporter: { select: { id: true, email: true, username: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const formatted = reports.map((r) => ({
    id: r.id,
    escortId: r.escortProfileId,
    escortName: r.escortProfile.displayName,
    reporterEmail: r.reporter?.email ?? r.reporter?.username ?? null,
    reporterName: r.reporter?.name ?? null,
    reason: r.reason,
    details: r.details ?? null,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    reviewedAt: r.reviewedAt?.toISOString() ?? null,
    reviewedBy: r.reviewedBy ?? null,
  }));

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Moderation
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Profile reports
          </h1>
          <p className="text-sm text-zinc-400">
            Review reports, disable profiles, or ban users.
          </p>
        </header>

        <ReportsTable reports={formatted} />
      </div>
    </main>
  );
}
