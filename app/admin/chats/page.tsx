import type { Metadata } from "next";
import { getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminChatDashboard } from "./_components/AdminChatDashboard";

export const metadata: Metadata = {
  title: "Support Chats",
  description: "Admin support chat dashboard.",
};

export default async function AdminChatsPage() {
  const session = await getAuthSession();
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!userId) {
    redirect("/auth/login?callbackUrl=/admin/chats");
  }

  if (role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-black">
      <AdminChatDashboard userId={userId} />
    </div>
  );
}
