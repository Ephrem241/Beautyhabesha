import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

import EscortsTable from "./_components/EscortsTable";

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminEscortsPage() {
  await requireAdmin();

  const escorts = await prisma.escortProfile.findMany({
    select: {
      id: true,
      displayName: true,
      city: true,
      status: true,
      createdAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          currentPlan: true,
          subscriptions: {
            where: { status: "active" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { planId: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedEscorts = escorts.map((escort: any) => ({
    id: escort.id,
    displayName: escort.displayName,
    city: escort.city ?? undefined,
    status: escort.status,
    plan: escort.user.subscriptions[0]?.planId ?? escort.user.currentPlan ?? "Normal",
    createdAt: escort.createdAt.toISOString(),
    userId: escort.userId,
    userName: escort.user.name ?? escort.user.email,
  }));

  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Admin dashboard
          </p>
          <h1 className="text-3xl font-semibold">Escort Management</h1>
          <p className="text-sm text-zinc-400">
            Review and manage escort profiles. Approve, reject, or suspend escorts.
          </p>
        </header>

        <div className="mt-8">
          <EscortsTable escorts={formattedEscorts} />
        </div>
      </div>
    </main>
  );
}