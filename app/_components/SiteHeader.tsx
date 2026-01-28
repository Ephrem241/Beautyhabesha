import Link from "next/link";

import { getAuthSession } from "@/lib/auth";
import SignOutButton from "./SignOutButton";

export default async function SiteHeader() {
  const session = await getAuthSession();
  const role = session?.user?.role;

  return (
    <header className="border-b border-zinc-900 bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 text-sm text-white">
        <Link
          href="/"
          className="text-xs font-semibold uppercase tracking-[0.4em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
        >
          Beautyhabesha
        </Link>
        <nav className="flex items-center gap-4 text-xs uppercase tracking-[0.2em] text-zinc-400">
          <Link
            href="/pricing"
            className="transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
          >
            Pricing
          </Link>
          <Link
            href="/escorts"
            className="transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
          >
            Escorts
          </Link>
          {session ? (
            <Link
              href="/dashboard"
              className="transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/login"
              className="transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
            >
              Login
            </Link>
          )}
          {role === "escort" ? (
            <Link
              href="/escort/profile"
              className="transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
            >
              My profile
            </Link>
          ) : null}
          {role === "admin" ? (
            <Link
              href="/dashboard/admin/subscriptions"
              className="transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
            >
              Admin
            </Link>
          ) : null}
          {session ? (
            <SignOutButton />
          ) : null}
        </nav>
      </div>
    </header>
  );
}
