type SkeletonCardProps = {
  className?: string;
};

export function SkeletonCard({ className = "" }: SkeletonCardProps) {
  return (
    <div
      className={`aspect-[4/5] w-full overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl ${className}`}
    >
      <div className="flex h-full flex-col">
        <div className="min-h-0 flex-1 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:800px_100%] animate-shimmer-card" />
        <div className="border-t border-zinc-800 bg-zinc-900/90 px-4 py-4">
          <div className="h-5 w-3/4 rounded-lg bg-zinc-800 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:800px_100%] animate-shimmer-card" />
          <div className="mt-2 h-4 w-1/2 rounded bg-zinc-800/80 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 bg-[length:800px_100%] animate-shimmer-card" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCardStack() {
  return (
    <div className="relative flex h-full w-full max-w-md items-center justify-center">
      <div className="relative h-full w-full" style={{ perspective: "1000px" }}>
        <div
          className="absolute inset-0 scale-[0.96] opacity-90"
          style={{ zIndex: 1 }}
        >
          <SkeletonCard />
        </div>
        <div
          className="absolute inset-0 scale-[0.98] opacity-95"
          style={{ zIndex: 2 }}
        >
          <SkeletonCard />
        </div>
        <div className="absolute inset-0" style={{ zIndex: 3 }}>
          <SkeletonCard />
        </div>
      </div>
    </div>
  );
}
