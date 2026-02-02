import { TableSkeleton } from "@/app/_components/ui/TableSkeleton";

export default function AdminUsersLoading() {
  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="space-y-3">
          <div className="h-3 w-32 rounded-full bg-zinc-800/60" />
          <div className="h-7 w-2/3 rounded-full bg-zinc-800/60" />
        </header>
        <div className="mt-8">
          <TableSkeleton rows={8} cols={5} />
        </div>
      </div>
    </main>
  );
}
