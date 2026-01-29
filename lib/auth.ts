import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
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
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
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
    async signIn({ user, account }) {
      // Handle Google OAuth sign in
      if (account?.provider === "google") {
        if (!user.email) {
          return false;
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
        });

        if (existingUser?.bannedAt) {
          return false;
        }

        if (!existingUser) {
          // Create new user from Google account
          await prisma.user.create({
            data: {
              email: user.email.toLowerCase(),
              name: user.name ?? undefined,
              role: "user",
              currentPlan: "Normal",
              subscriptionStatus: "inactive",
              // No password for OAuth users
            },
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        let dbUser: { id: string; role: string } | null = null;
        if (account?.provider === "credentials" && user.id) {
          dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true, role: true },
          });
        } else if (user.email?.includes("@")) {
          dbUser = await prisma.user.findUnique({
            where: { email: user.email.toLowerCase() },
            select: { id: true, role: true },
          });
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
