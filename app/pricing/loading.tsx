import Skeleton from "@/app/_components/ui/Skeleton";

export default function PricingLoading() {
  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="space-y-3 text-center">
          <Skeleton className="mx-auto h-3 w-28" />
          <Skeleton className="mx-auto h-8 w-1/2" />
          <Skeleton className="mx-auto h-3 w-2/3" />
        </header>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`pricing-skeleton-${index}`}
              className="rounded-3xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="mt-4 h-8 w-1/2" />
              <Skeleton className="mt-3 h-3 w-2/3" />
              <div className="mt-6 space-y-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="mt-6 h-10 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
