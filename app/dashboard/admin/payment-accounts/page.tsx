import Link from "next/link";
import nextDynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { getAllPaymentAccountsForAdmin } from "@/lib/payment-accounts";
import { TableSkeleton } from "@/app/_components/ui/TableSkeleton";

const PaymentAccountForm = nextDynamic(() =>
  import("./_components/PaymentAccountForm").then((m) => m.PaymentAccountForm)
);
const PaymentAccountsTable = nextDynamic(
  () => import("./_components/PaymentAccountsTable").then((m) => m.PaymentAccountsTable),
  { loading: () => <TableSkeleton rows={5} cols={5} /> }
);

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminPaymentAccountsPage() {
  await requireAdmin();
  const accounts = await getAllPaymentAccountsForAdmin();

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Admin
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Payment accounts</h1>
          <p className="text-sm text-zinc-400">
            Bank and mobile money accounts shown on the payment instructions page. Reorder via
            display order; toggle active to hide without deleting.
          </p>
          <Link
            href="/dashboard"
            className="mt-2 w-fit text-sm text-zinc-500 transition hover:text-zinc-300"
          >
            ← Back to dashboard
          </Link>
        </header>

        <div className="mt-8 space-y-8">
          <PaymentAccountForm />
          <section>
            <h2 className="mb-4 text-lg font-semibold text-white">All payment accounts</h2>
            <PaymentAccountsTable accounts={accounts} />
          </section>
        </div>
      </div>
    </main>
  );
}
