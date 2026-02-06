import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { pusher } from "@/lib/pusher";

/**
 * Pusher Private Channel Authorization Endpoint
 * 
 * This endpoint authorizes users to subscribe to private Pusher channels.
 * Private channels ensure that only authenticated users can access their own data.
 * 
 * Channel naming convention: private-user-{userId}
 * 
 * Security:
 * - Requires authentication
 * - Verifies user can only access their own channels
 * - Uses server-side authorization with Pusher secret
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Check authentication
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Parse Pusher auth request
    const body = await req.json();
    const { socket_id, channel_name } = body;

    if (!socket_id || !channel_name) {
      return NextResponse.json(
        { error: "Missing socket_id or channel_name" },
        { status: 400 }
      );
    }

    // 3. Verify user can access this channel
    // For support chat: private-support-room-{roomId}
    // For user-specific: private-user-{userId}
    const userId = session.user.id;
    const isAdmin = session.user.role === "admin";

    // Allow admins to access all support channels
    if (isAdmin && channel_name.startsWith("private-support-room-")) {
      if (!pusher) {
        return NextResponse.json(
          { error: "Pusher not configured" },
          { status: 500 }
        );
      }

      const auth = pusher.authorizeChannel(socket_id, channel_name);
      return NextResponse.json(auth);
    }

    // For regular users, verify they own the channel
    if (channel_name.startsWith("private-user-")) {
      const channelUserId = channel_name.replace("private-user-", "");
      if (channelUserId !== userId) {
        return NextResponse.json(
          { error: "Forbidden: Cannot access other user's channel" },
          { status: 403 }
        );
      }
    } else if (channel_name.startsWith("private-support-room-")) {
      // For support rooms, verify user owns the room
      const roomId = channel_name.replace("private-support-room-", "");
      
      // Import prisma here to avoid circular dependencies
      const { prisma } = await import("@/lib/db");
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        select: { userId: true },
      });

      if (!room || room.userId !== userId) {
        return NextResponse.json(
          { error: "Forbidden: Cannot access this support room" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Invalid channel name" },
        { status: 400 }
      );
    }

    // 4. Authorize the channel
    if (!pusher) {
      return NextResponse.json(
        { error: "Pusher not configured" },
        { status: 500 }
      );
    }

    const auth = pusher.authorizeChannel(socket_id, channel_name);
    return NextResponse.json(auth);
  } catch (error) {
    console.error("[Pusher Auth] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

