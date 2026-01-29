import { prisma } from "@/lib/db";

export type BookingWithRelations = Awaited<
  ReturnType<typeof getBookingById>
>;

export async function getBookingById(bookingId: string, userId?: string | null) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: { select: { id: true, email: true, username: true, name: true } },
      escortProfile: { select: { id: true, displayName: true, userId: true, user: { select: { email: true, username: true } } } },
      depositPayments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!booking) return null;
  if (userId && booking.userId !== userId) {
    const escortUserId = booking.escortProfile.userId;
    if (escortUserId !== userId) return null;
  }
  return booking;
}

export async function getBookingsForUser(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      escortProfile: { select: { id: true, displayName: true } },
      depositPayments: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}

export async function getBookingsForEscort(escortProfileId: string) {
  return prisma.booking.findMany({
    where: { escortId: escortProfileId },
    include: {
      user: { select: { id: true, email: true, username: true, name: true } },
      depositPayments: { where: { status: "approved" }, orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}

export async function getPendingDepositsForAdmin() {
  return prisma.depositPayment.findMany({
    where: { status: "pending" },
    include: {
      booking: {
        include: {
          user: { select: { id: true, email: true, name: true } },
          escortProfile: { select: { id: true, displayName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBookingsForAdmin() {
  return prisma.booking.findMany({
    include: {
      user: { select: { id: true, email: true, username: true, name: true } },
      escortProfile: { select: { id: true, displayName: true } },
      depositPayments: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
}
