import Skeleton from "@/app/_components/ui/Skeleton";

export default function EscortsLoading() {
  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </header>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`escort-skeleton-${index}`}
              className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950"
            >
              <Skeleton className="h-48 w-full rounded-none" />
              <div className="space-y-3 p-6">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-9 w-28 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
