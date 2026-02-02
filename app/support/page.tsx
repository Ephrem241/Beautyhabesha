import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Skeleton } from "@/app/_components/ui/Skeleton";

const SupportPageClient = dynamic(() => import("./_components/SupportPageClient").then((m) => m.SupportPageClient), {
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
});

export const metadata: Metadata = {
  title: "Support",
  description: "Chat with our support team.",
};

export default async function SupportPage() {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!userId) {
    redirect("/auth/login?callbackUrl=/support");
  }

  if (role === "admin") {
    redirect("/admin/chats");
  }

  return (
    <div className="min-h-screen bg-black">
      <SupportPageClient userId={userId} />
    </div>
  );
}
