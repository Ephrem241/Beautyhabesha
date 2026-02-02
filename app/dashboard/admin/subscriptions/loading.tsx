import Skeleton from "@/app/_components/ui/Skeleton";

export default function AdminSubscriptionsLoading() {
  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-7 w-2/3" />
        </header>
        <div className="mt-8 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
