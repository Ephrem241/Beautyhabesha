import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create the NextAuth handler for App Router
const handler = NextAuth(authOptions);

// Export the handler as both GET and POST
export { handler as GET, handler as POST };
