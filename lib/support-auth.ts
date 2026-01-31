import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export type SupportAuth = {
  userId: string;
  role: "admin" | "user" | "escort";
  isAdmin: boolean;
};

export async function getSupportAuth(req: NextRequest): Promise<SupportAuth | null> {
  const token = await getToken({ req });
  if (!token?.uid || typeof token.uid !== "string") return null;
  const role = (token.role as "admin" | "user" | "escort") ?? "user";
  return {
    userId: token.uid,
    role,
    isAdmin: role === "admin",
  };
}
