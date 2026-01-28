import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "admin" | "escort" | "user";
      name?: string | null;
      email?: string | null;
    };
  }

  interface User {
    id: string;
    role: "admin" | "escort" | "user";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    role?: "admin" | "escort" | "user";
  }
}
