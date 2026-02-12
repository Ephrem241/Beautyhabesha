import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";

type PostLoginPageProps = {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
};

function safeCallbackUrl(value: string | undefined): string | null {
  if (!value || typeof value !== "string") return null;
  const path = value.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path === "/" || path === "/dashboard") return null;
  return path;
}

function getRoleDefaultRedirect(role: "admin" | "escort" | "user" | undefined): string {
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard";
}

export default async function PostLoginPage({ searchParams }: PostLoginPageProps) {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const safeCallback = safeCallbackUrl(params.callbackUrl);
  if (safeCallback) {
    redirect(safeCallback);
  }

  redirect(getRoleDefaultRedirect(session.user.role));
}
