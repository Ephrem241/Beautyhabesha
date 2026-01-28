import SpotlightSkeleton from "@/app/_components/ui/SpotlightSkeleton";

export default function PublicLoading() {
  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <div className="space-y-4">
            <div className="h-3 w-32 rounded-full bg-zinc-800/60" />
            <div className="h-7 w-2/3 rounded-full bg-zinc-800/60" />
            <div className="h-3 w-3/4 rounded-full bg-zinc-800/60" />
            <div className="h-3 w-2/3 rounded-full bg-zinc-800/60" />
          </div>
        </section>

        <section className="mt-10">
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
