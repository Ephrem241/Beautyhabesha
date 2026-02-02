import Skeleton from "@/app/_components/ui/Skeleton";

export default function PrivacyLoading() {
  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </main>
  );
}
