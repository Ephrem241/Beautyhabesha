import Link from "next/link";
import { redirect } from "next/navigation";
import { unstable_noStore } from "next/cache";

import { getAuthSession } from "@/lib/auth";

const ADMIN_SECTIONS = [
  { href: "/dashboard/admin/users", label: "User Management", description: "View and manage user roles, ban/unban, auto-renew" },
  { href: "/dashboard/admin/bookings", label: "Bookings", description: "Manage all bookings and pending deposits" },
  { href: "/dashboard/admin/subscriptions", label: "Subscriptions", description: "Review and approve subscription requests" },
  { href: "/dashboard/admin/payments", label: "Payments", description: "Pending payments and subscription payment records" },
  { href: "/dashboard/admin/escorts", label: "Models", description: "Approve, reject, or suspend model profiles" },
  { href: "/dashboard/admin/escorts/create", label: "Create Model", description: "Add a new model account" },
  { href: "/dashboard/admin/plans", label: "Plans", description: "Manage subscription plans (Normal, VIP, Platinum)" },
  { href: "/dashboard/admin/payment-accounts", label: "Payment Accounts", description: "Telebirr and bank details for payments" },
  { href: "/dashboard/admin/reports", label: "Profile Reports", description: "Review reports (fake, underage, abuse, scam)" },
  { href: "/dashboard/admin/consent", label: "Consent History", description: "View age and terms consent records" },
  { href: "/admin/chats", label: "Support Chats", description: "Reply to user support messages" },
];

export default async function AdminDashboardPage() {
  unstable_noStore();

  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Admin dashboard
          </p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Management</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Choose a section below to manage users, bookings, payments, models, and more.
          </p>
        </header>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {ADMIN_SECTIONS.map(({ href, label, description }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-emerald-400 hover:bg-zinc-900/50 sm:p-5"
            >
              <span className="text-sm font-semibold text-white">{label}</span>
              <span className="mt-1 text-xs text-zinc-500">{description}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
