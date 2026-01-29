import { prisma } from "@/lib/db";

export type AvailabilitySlot = {
  id: string;
  escortId: string;
  date: Date;
  startTime: string;
  endTime: string;
  mode: "online" | "in_person";
  isBooked: boolean;
  createdAt: Date;
};

/**
 * Get availability for an escort (escort dashboard or admin). Future dates only by default.
 */
export async function getAvailabilityForEscort(
  escortId: string,
  options?: { fromDate?: Date; toDate?: Date; mode?: "online" | "in_person" }
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const from = options?.fromDate ?? today;
  const to = options?.toDate ?? new Date(from.getTime() + 90 * 24 * 60 * 60 * 1000);

  const where: {
    escortId: string;
    date: { gte: Date; lte: Date };
    mode?: "online" | "in_person";
  } = {
    escortId,
    date: { gte: from, lte: to },
  };
  if (options?.mode) {
    where.mode = options.mode;
  }

  return prisma.availability.findMany({
    where,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });
}

/**
 * Public read-only: get availability for an escort (for users viewing calendar).
 */
export async function getPublicAvailability(
  escortId: string,
  options?: { fromDate?: Date; toDate?: Date; mode?: "online" | "in_person" }
): Promise<AvailabilitySlot[]> {
  const slots = await getAvailabilityForEscort(escortId, options);
  return slots.map((s) => ({
    id: s.id,
    escortId: s.escortId,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    mode: s.mode as "online" | "in_person",
    isBooked: s.isBooked,
    createdAt: s.createdAt,
  }));
}
