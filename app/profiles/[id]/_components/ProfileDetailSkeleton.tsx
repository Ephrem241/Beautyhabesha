import Skeleton from "@/app/_components/ui/Skeleton";

export function ProfileDetailSkeleton() {
  return (
    <div className="min-h-screen bg-black pb-[88px] md:pb-[96px]">
      {/* Header skeleton */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-zinc-800/80 bg-black/90 px-4 py-3 backdrop-blur-md">
        <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </header>

      {/* Hero image skeleton */}
      <div className="h-[80vh] w-full overflow-hidden rounded-b-3xl">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Bottom CTA skeleton */}
      <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] md:px-6 md:pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        <Skeleton className="h-[60px] w-full rounded-xl" />
      </div>
    </div>
  );
}
