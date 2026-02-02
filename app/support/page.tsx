import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SupportPageClientLoader } from "./_components/SupportPageClientLoader";

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
      <SupportPageClientLoader userId={userId} />
    </div>
  );
}
