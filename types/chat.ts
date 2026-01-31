export type ChatUser = {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  role?: "admin" | "user" | "escort";
};

export type ChatMessage = {
  id: string;
  roomId: string;
  senderId: string;
  text: string | null;
  image: string | null;
  createdAt: string;
  sender: ChatUser;
};

export type ChatRoomSummary = {
  id: string;
  userId: string;
  resolved: boolean;
  createdAt: string;
  user: ChatUser;
  lastMessage?: {
    id: string;
    text: string | null;
    image: string | null;
    createdAt: string;
    senderId: string;
  } | null;
  messageCount?: number;
};
