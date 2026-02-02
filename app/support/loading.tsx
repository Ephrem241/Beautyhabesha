import Skeleton from "@/app/_components/ui/Skeleton";

export default function SupportLoading() {
  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton
              key={i}
              className={`h-12 rounded-xl ${i % 2 === 0 ? "mr-1/4 w-3/4" : "ml-1/4 w-3/4"}`}
            />
          ))}
        </div>
        <Skeleton className="mt-4 h-12 w-full rounded-xl" />
      </div>
    </main>
  );
}
