import Skeleton from "@/app/_components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-6 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-3/4" />
        <div className="mt-8 space-y-6">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
