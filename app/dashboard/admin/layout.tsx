import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <nav
        className="sticky top-0 z-20 border-b border-zinc-800 bg-black/95 px-4 py-3 backdrop-blur sm:px-6"
        aria-label="Admin navigation"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3">
          <Link
            href="/dashboard/admin"
            className="text-sm font-semibold text-emerald-400 transition hover:text-emerald-300"
          >
            ← Admin hub
          </Link>
          <span className="text-zinc-600" aria-hidden>|</span>
          <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
            <Link href="/dashboard/admin/users" className="hover:text-zinc-300">Users</Link>
            <Link href="/dashboard/admin/bookings" className="hover:text-zinc-300">Bookings</Link>
            <Link href="/dashboard/admin/subscriptions" className="hover:text-zinc-300">Subscriptions</Link>
            <Link href="/dashboard/admin/payments" className="hover:text-zinc-300">Payments</Link>
            <Link href="/dashboard/admin/escorts" className="hover:text-zinc-300">Models</Link>
            <Link href="/dashboard/admin/plans" className="hover:text-zinc-300">Plans</Link>
            <Link href="/dashboard/admin/reports" className="hover:text-zinc-300">Reports</Link>
          </div>
        </div>
      </nav>
      {children}
    </>
  );
}
