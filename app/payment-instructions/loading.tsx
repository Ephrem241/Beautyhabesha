import Skeleton from "@/app/_components/ui/Skeleton";

export default function PaymentInstructionsLoading() {
  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-xl space-y-6">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </main>
  );
}
