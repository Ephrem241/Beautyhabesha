export default function Loading() {
  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
        <div className="mt-4 h-6 w-96 animate-pulse rounded bg-zinc-800" />
        <div className="mt-8 h-64 animate-pulse rounded-2xl bg-zinc-900" />
        <div className="mt-8 h-48 animate-pulse rounded-2xl bg-zinc-900" />
      </div>
    </main>
  );
}
