import Skeleton from "@/app/_components/ui/Skeleton";

export default function ProfileAvailabilityLoading() {
  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <Skeleton className="h-8 w-64" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}

