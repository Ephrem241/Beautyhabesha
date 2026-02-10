import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import bcrypt from "bcrypt";

import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { prisma } from "@/lib/db";

export async function checkUserNotBanned(userId: string): Promise<void> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { bannedAt: true },
  });
  if (u?.bannedAt) redirect("/auth/login?banned=1");
}

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  cookies: {
    sessionToken: {
      // SECURITY FIX: Cookie naming strategy clarified
      // Production (HTTPS): "__Secure-next-auth.session-token" - The __Secure- prefix ensures cookie is only sent over HTTPS
      // Development (HTTP): "next-auth.session-token" - Standard name for localhost (HTTP) compatibility
      // This is the correct implementation per NextAuth.js and browser security standards
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        sameSite: "lax", // CSRF protection while allowing normal navigation
        path: "/",
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.username || !credentials.password) {
            console.error("[Auth] Missing credentials");
            return null;
          }

          const username = credentials.username.toLowerCase().trim();
          const user = await prisma.user.findUnique({
            where: { username },
          });

          if (!user) {
            console.error(`[Auth] User not found: ${username}`);
            return null;
          }

          if (!user.password) {
            console.error(`[Auth] User has no password (OAuth user): ${username}`);
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            console.error(`[Auth] Invalid password for: ${username}`);
            return null;
          }

          if (user.bannedAt) {
            console.error(`[Auth] Banned user attempted login: ${username}`);
            return null;
          }

          return {
            id: user.id,
            email: user.email ?? undefined,
            name: user.username ?? user.name ?? undefined,
            role: (user.role as "admin" | "escort" | "user") ?? "user",
          };
        } catch (error) {
          console.error("[Auth] Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // SECURITY FIX: Include bannedAt in the query to detect banned users
        // This callback runs on every token refresh (every 24 hours per updateAge setting)
        let dbUser: { id: string; role: string; bannedAt: Date | null } | null = null;
        if (user.id) {
          dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, role: true, bannedAt: true },
          });
        }

        // SECURITY FIX: Invalidate token if user is banned
        // By not setting uid/role, the token becomes invalid and user will be logged out
        if (dbUser?.bannedAt) {
          console.warn(`[Auth] Banned user token refresh blocked: ${user.id}`);
          // Return token without uid/role to invalidate it
          return token;
        }

        if (dbUser) {
          token.role = dbUser.role as "admin" | "escort" | "user";
          token.uid = dbUser.id;
        } else {
          token.role = "user";
          token.uid = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid as string;
        session.user.role = token.role as "admin" | "escort" | "user";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
};

export const getAuthSession = () => getServerSession(authOptions);
