import { redirect } from "next/navigation";

export default function AdminChatsRedirect() {
  redirect("/dashboard/admin/chats");
}
