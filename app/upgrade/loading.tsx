import Skeleton from "@/app/_components/ui/Skeleton";

export default function UpgradeLoading() {
  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-5xl">
        <header className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-3 w-2/3" />
        </header>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="mt-4 h-6 w-1/2" />
              <Skeleton className="mt-3 h-3 w-full" />
              <Skeleton className="mt-4 h-3 w-2/3" />
              <div className="mt-4 space-y-3">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-black p-6">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-4 h-3 w-full" />
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            </div>
            <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="mt-4 h-10 w-full rounded-2xl" />
              <Skeleton className="mt-4 h-40 w-full rounded-2xl" />
              <Skeleton className="mt-6 h-10 w-full rounded-full" />
            </div>
          </div>

          <aside className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="mt-4 h-3 w-full" />
            <Skeleton className="mt-3 h-3 w-2/3" />
          </aside>
        </div>
      </div>
    </main>
  );
}
