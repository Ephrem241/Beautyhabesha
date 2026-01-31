import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as NetServer } from "http";
import { Server as SocketIOServer } from "socket.io";

type NextApiResponseServerIo = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

type JoinRoomPayload = {
  roomId: string;
  role?: "admin" | "user" | "escort";
  userId?: string;
};

type SendMessagePayload = {
  roomId: string;
  message: Record<string, unknown>;
  room?: Record<string, unknown>;
};

type TypingPayload = {
  roomId: string;
  senderId: string;
  senderRole?: "admin" | "user" | "escort";
};

const ADMIN_ROOM = "admin";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponseServerIo
) {
  if (!res.socket.server.io) {
    const io = new SocketIOServer(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
    });
    res.socket.server.io = io;

    const presence = new Map<
      string,
      { userSockets: Set<string>; adminSockets: Set<string> }
    >();
    const socketRooms = new Map<string, Set<string>>();
    const socketRoles = new Map<string, "admin" | "user" | "escort">();

    const emitPresence = (roomId: string) => {
      const entry = presence.get(roomId);
      const payload = {
        roomId,
        userOnline: Boolean(entry && entry.userSockets.size > 0),
        adminOnline: Boolean(entry && entry.adminSockets.size > 0),
      };
      io.to(roomId).emit("room_presence", payload);
      io.to(ADMIN_ROOM).emit("room_presence", payload);
    };

    const updatePresence = (
      roomId: string,
      role: "admin" | "user" | "escort",
      socketId: string,
      action: "join" | "leave"
    ) => {
      if (!roomId || roomId === ADMIN_ROOM) return;
      const entry =
        presence.get(roomId) ??
        { userSockets: new Set<string>(), adminSockets: new Set<string>() };
      const target = role === "admin" ? entry.adminSockets : entry.userSockets;
      if (action === "join") {
        target.add(socketId);
      } else {
        target.delete(socketId);
      }
      presence.set(roomId, entry);
      emitPresence(roomId);
    };

    io.on("connection", (socket) => {
      socket.on("join_room", (payload: JoinRoomPayload) => {
        const roomId = payload?.roomId;
        if (!roomId) return;
        const role = payload.role ?? socketRoles.get(socket.id) ?? "user";
        socketRoles.set(socket.id, role);
        socket.join(roomId);

        const rooms = socketRooms.get(socket.id) ?? new Set<string>();
        rooms.add(roomId);
        if (role === "admin") {
          socket.join(ADMIN_ROOM);
          rooms.add(ADMIN_ROOM);
        }
        socketRooms.set(socket.id, rooms);
        updatePresence(roomId, role, socket.id, "join");
      });

      socket.on("send_message", (payload: SendMessagePayload) => {
        const roomId = payload?.roomId;
        if (!roomId) return;
        io.to(roomId).emit("receive_message", payload);
        if (roomId !== ADMIN_ROOM) {
          io.to(ADMIN_ROOM).emit("receive_message", payload);
        }
      });

      socket.on("typing", (payload: TypingPayload) => {
        if (!payload?.roomId) return;
        io.to(payload.roomId).emit("typing", payload);
      });

      socket.on("stop_typing", (payload: TypingPayload) => {
        if (!payload?.roomId) return;
        io.to(payload.roomId).emit("stop_typing", payload);
      });

      socket.on("disconnect", () => {
        const rooms = socketRooms.get(socket.id);
        const role = socketRoles.get(socket.id) ?? "user";
        if (rooms) {
          rooms.forEach((roomId) => {
            updatePresence(roomId, role, socket.id, "leave");
          });
        }
        socketRooms.delete(socket.id);
        socketRoles.delete(socket.id);
      });
    });
  }

  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
