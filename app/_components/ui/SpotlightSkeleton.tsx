import Skeleton from "./Skeleton";

export default function SpotlightSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  );
}
