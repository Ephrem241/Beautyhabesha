import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/db";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request });

  // Check if route requires authentication
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/escort") ||
    pathname.startsWith("/upload-proof") ||
    pathname.startsWith("/support") ||
    pathname.startsWith("/chat");

  if (isProtectedRoute) {
    // Redirect to login if no token
    if (!token) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("callbackUrl", request.nextUrl.pathname + request.nextUrl.search);
      return NextResponse.redirect(url);
    }

    // SECURITY FIX: Check if user is banned
    // This prevents banned users from accessing the system even if they have a valid JWT token
    if (token.uid) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: token.uid as string },
          select: { bannedAt: true },
        });

        if (user?.bannedAt) {
          console.warn(`[Security] Banned user attempted access: ${token.uid}`);
          const url = request.nextUrl.clone();
          url.pathname = "/auth/login";
          url.searchParams.set("banned", "1");
          return NextResponse.redirect(url);
        }
      } catch (error) {
        console.error("[Middleware] Error checking ban status:", error);
        // Continue to allow access if database query fails (fail open for availability)
        // In production, you might want to fail closed instead
      }
    }
  }

  // Admin-only routes
  if (pathname.startsWith("/dashboard/admin") || pathname.startsWith("/admin")) {
    if (token?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Escort-only routes (admins can also access escort routes for moderation)
  if (pathname.startsWith("/escort")) {
    if (token?.role !== "escort" && token?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/escort/:path*", "/upload-proof", "/support", "/chat/:path*"],
};
