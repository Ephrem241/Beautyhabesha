import Link from "next/link";
import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { extractImageUrls } from "@/lib/image-helpers";
import { TableSkeleton } from "@/app/_components/ui/TableSkeleton";

const EscortsTable = nextDynamic(() => import("./_components/EscortsTable"), {
  loading: () => <TableSkeleton rows={8} cols={6} />,
});

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

type Props = { searchParams: Promise<{ created?: string; username?: string; page?: string; limit?: string }> };

export default async function AdminEscortsPage({ searchParams }: Props) {
  // Opt into dynamic rendering for admin dashboard
  unstable_noStore();

  await requireAdmin();
  const params = await searchParams;
  const showCreated = params.created === "1";
  const createdUsername = params.username ?? null;
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(params.limit ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
  const skip = (page - 1) * limit;

  const escorts = await prisma.escortProfile.findMany({
    skip,
    take: limit,
    select: {
      id: true,
      displayName: true,
      city: true,
      status: true,
      images: true,
      createdAt: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
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

  const formattedEscorts = escorts.map((escort) => {
    const urls = extractImageUrls(escort.images);
    return {
      id: escort.id,
      displayName: escort.displayName,
      city: escort.city ?? undefined,
      status: escort.status,
      hasImage: urls.length > 0,
      profileImageUrl: urls[0] ?? null,
      plan: escort.user.subscriptions[0]?.planId ?? escort.user.currentPlan ?? "Normal",
      createdAt: escort.createdAt.toISOString(),
      userId: escort.userId,
      userName: escort.user.name ?? escort.user.username ?? escort.user.email ?? "—",
    };
  });

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
              Admin dashboard
            </p>
            <h1 className="text-2xl font-semibold sm:text-3xl">Model Management</h1>
            <p className="mt-1 text-sm text-zinc-400">
              Review and manage model profiles. Approve, reject, or suspend models.
            </p>
          </div>
          <Link
            href="/dashboard/admin/escorts/create"
            className="mt-4 shrink-0 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-950 transition hover:bg-emerald-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 sm:mt-0"
          >
            Create model
          </Link>
        </header>

        {showCreated && (
          <div className="mt-6 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            Model account created and approved.
            {createdUsername && (
              <span className="mt-1 block">
                Sign in with username <strong>{createdUsername}</strong> and the default model password.
              </span>
            )}
          </div>
        )}

        <div className="mt-6 sm:mt-8">
          <EscortsTable escorts={formattedEscorts} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          {page > 1 && (
            <Link
              href={
                showCreated
                  ? `/dashboard/admin/escorts?created=1&username=${encodeURIComponent(createdUsername ?? "")}&page=${page - 1}&limit=${limit}`
                  : `/dashboard/admin/escorts?page=${page - 1}&limit=${limit}`
              }
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-zinc-300 transition hover:border-emerald-500 hover:text-emerald-300"
            >
              ← Previous
            </Link>
          )}
          {escorts.length === limit && (
            <Link
              href={
                showCreated
                  ? `/dashboard/admin/escorts?created=1&username=${encodeURIComponent(createdUsername ?? "")}&page=${page + 1}&limit=${limit}`
                  : `/dashboard/admin/escorts?page=${page + 1}&limit=${limit}`
              }
              className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-2 text-emerald-300 transition hover:bg-emerald-500/20"
            >
              Next page →
            </Link>
          )}
          {page > 1 && escorts.length < limit && (
            <span className="text-zinc-500">Page {page}</span>
          )}
        </div>
      </div>
    </main>
  );
}