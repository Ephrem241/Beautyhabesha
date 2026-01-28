import Skeleton from "@/app/_components/ui/Skeleton";

export default function EscortDetailLoading() {
  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-5xl">
        <header className="space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
            <div className="mt-6 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </section>

          <aside className="rounded-3xl border border-zinc-800 bg-black p-6">
            <Skeleton className="h-3 w-32" />
            <div className="mt-4 space-y-3">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="mt-6 h-10 w-full rounded-2xl" />
          </aside>
        </div>
      </div>
    </main>
  );
}
