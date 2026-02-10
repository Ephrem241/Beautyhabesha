import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * Explicit session endpoint so GET /api/auth/session is always handled.
 * NextAuth's [...nextauth] catch-all can 404 on some Next.js versions; this route takes precedence.
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  return Response.json(session ?? {});
}
