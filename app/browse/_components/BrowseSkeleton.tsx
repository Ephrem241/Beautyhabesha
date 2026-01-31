import Skeleton from "@/app/_components/ui/Skeleton";

export function BrowseSkeleton() {
  return (
    <div className="fixed inset-0 bg-black">
      <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="flex h-full items-center justify-center p-4">
        <div className="relative h-full w-full max-w-md">
          <Skeleton className="h-full w-full rounded-2xl" />
        </div>
      </div>
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-6">
        <Skeleton className="h-14 w-14 rounded-full" />
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    </div>
  );
}
