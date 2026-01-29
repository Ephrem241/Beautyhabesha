import Link from "next/link";
import { redirect } from "next/navigation";

import { getAuthSession } from "@/lib/auth";
import { createEscortByAdmin } from "./actions";
import { CreateEscortForm } from "./_components/CreateEscortForm";

async function requireAdmin() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }
}

export default async function AdminCreateEscortPage() {
  await requireAdmin();

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Admin
          </p>
          <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
            Create escort
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Add a new escort with name and 3–12 images (first = profile). Uses default email
            (escort-…@default.local) and default password. Profile approved immediately. Contact:
            Telegram @abeni_agent, WhatsApp +251912696090.
          </p>
        </header>

        <CreateEscortForm createAction={createEscortByAdmin} />

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link
            href="/dashboard/admin/escorts"
            className="text-emerald-400 hover:underline"
          >
            ← Back to Manage escorts
          </Link>
        </p>
      </div>
    </main>
  );
}
