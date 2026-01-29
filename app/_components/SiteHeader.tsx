import Link from "next/link";

import { getAuthSession } from "@/lib/auth";
import HeaderNav from "./HeaderNav";

export default async function SiteHeader() {
  const session = await getAuthSession();
  const role = session?.user?.role ?? null;
  const isLoggedIn = !!session;

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-900 bg-black/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 text-sm text-white sm:px-6">
        <Link
          href="/"
          className="min-w-0 shrink truncate text-xs font-semibold uppercase tracking-[0.4em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
        >
          Beautyhabesha
        </Link>
        <div className="shrink-0">
          <HeaderNav isLoggedIn={isLoggedIn} role={role} />
        </div>
      </div>
    </header>
  );
}
