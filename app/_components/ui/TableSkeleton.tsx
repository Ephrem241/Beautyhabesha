import Skeleton from "@/app/_components/ui/Skeleton";

type TableSkeletonProps = {
  rows?: number;
  cols?: number;
  className?: string;
};

export function TableSkeleton({
  rows = 5,
  cols = 5,
  className = "",
}: TableSkeletonProps) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 ${className}`}
    >
      <div className="border-b border-zinc-800 px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: Math.min(cols, 6) }).map((_, i) => (
            <Skeleton key={`th-${i}`} className="h-3 w-24" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-zinc-900">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={`row-${rowIndex}`}
            className="grid gap-4 px-4 py-3 sm:px-6 sm:py-4"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-3 w-full min-w-0" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
