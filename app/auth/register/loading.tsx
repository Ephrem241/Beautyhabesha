import Skeleton from "@/app/_components/ui/Skeleton";

export default function RegisterLoading() {
  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-lg space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-10 w-full rounded-xl" />
      </div>
    </main>
  );
}
