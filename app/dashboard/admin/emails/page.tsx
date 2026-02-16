import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";
import Link from "next/link";

import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminEmailsPage() {
  unstable_noStore();

  await requireAdmin();

  const emails = await prisma.emailLog.findMany({
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Admin dashboard
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Email log</h1>
          <p className="text-sm text-zinc-400">
            Sent notification emails (payment upload, booking, etc.).
          </p>
        </header>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="p-3 font-semibold text-zinc-300">Sent</th>
                <th className="p-3 font-semibold text-zinc-300">To</th>
                <th className="p-3 font-semibold text-zinc-300">Subject</th>
                <th className="p-3 font-semibold text-zinc-300">Type</th>
                <th className="p-3 font-semibold text-zinc-300">Details</th>
              </tr>
            </thead>
            <tbody>
              {emails.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500">
                    No emails logged yet.
                  </td>
                </tr>
              ) : (
                emails.map((row) => {
                  const meta = row.metadata as { paymentId?: string } | null;
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-zinc-800/80 last:border-0"
                    >
                      <td className="p-3 text-zinc-400">
                        {row.sentAt.toLocaleString()}
                      </td>
                      <td className="p-3 text-zinc-300">{row.to}</td>
                      <td className="p-3 text-zinc-300">{row.subject}</td>
                      <td className="p-3 text-zinc-400">{row.type}</td>
                      <td className="p-3">
                        {meta?.paymentId ? (
                          <Link
                            href="/dashboard/admin/payments"
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            Payment {meta.paymentId.slice(0, 8)}…
                          </Link>
                        ) : (
                          <span className="text-zinc-500">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
