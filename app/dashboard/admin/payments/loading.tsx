import Skeleton from "@/app/_components/ui/Skeleton";

export default function AdminPaymentsLoading() {
  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-7 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </header>

        <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <div className="border-b border-zinc-800 px-6 py-4">
            <Skeleton className="h-3 w-48" />
          </div>
          <div className="divide-y divide-zinc-900">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`payment-skeleton-${index}`}
                className="grid grid-cols-6 gap-4 px-6 py-4"
              >
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-8 w-24 rounded-full" />
                <Skeleton className="h-8 w-28 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
