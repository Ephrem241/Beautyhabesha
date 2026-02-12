import SpotlightSkeleton from "@/app/_components/ui/SpotlightSkeleton";

export default function RootLoading() {
  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-12 text-white sm:px-6 sm:pb-20 sm:pt-16">
      <div className="mx-auto max-w-6xl">
        {/* Hero skeleton */}
        <section className="relative mb-6 min-h-[160px] overflow-hidden rounded-2xl border border-zinc-800 sm:mb-8 sm:min-h-[180px] sm:rounded-3xl">
          <div className="absolute inset-0 bg-zinc-900/80" aria-hidden />
          <div className="relative z-10 flex min-h-[160px] items-center justify-center sm:min-h-[180px]">
            <div className="h-3 w-48 animate-pulse rounded-full bg-zinc-800/60 sm:w-64" />
          </div>
        </section>

        {/* Premium section skeleton */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:rounded-3xl sm:p-6 lg:p-8">
          <div className="space-y-4">
            <div className="h-3 w-32 rounded-full bg-zinc-800/60" />
            <div className="h-7 w-2/3 rounded-full bg-zinc-800/60" />
            <div className="h-3 w-3/4 rounded-full bg-zinc-800/60" />
            <div className="h-3 w-2/3 rounded-full bg-zinc-800/60" />
          </div>
        </section>

        {/* Spotlight skeleton */}
        <section className="mt-8 sm:mt-10">
          <div className="flex items-center justify-between">
            <div className="h-4 w-48 rounded-full bg-zinc-800/60" />
            <div className="h-3 w-24 rounded-full bg-zinc-800/60" />
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <SpotlightSkeleton />
            <SpotlightSkeleton />
            <SpotlightSkeleton />
          </div>
        </section>
      </div>
    </main>
  );
}
