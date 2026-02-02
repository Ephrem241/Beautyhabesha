"use client";

import dynamic from "next/dynamic";
import Skeleton from "@/app/_components/ui/Skeleton";

const SupportPageClient = dynamic(
  () => import("./SupportPageClient").then((m) => m.SupportPageClient),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-black px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      </div>
    ),
  }
);

type Props = { userId: string };

export function SupportPageClientLoader({ userId }: Props) {
  return <SupportPageClient userId={userId} />;
}
