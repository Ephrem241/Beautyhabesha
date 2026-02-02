import "server-only";
import { prisma } from "@/lib/db";

const ARCHIVE_BATCH_SIZE = 500;

/**
 * Copy messages older than `days` into MessageArchive, then delete them.
 * Call inside a transaction or use $transaction in the cron route.
 */
export async function archiveMessagesOlderThan(days: number): Promise<{ archived: number; deleted: number }> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const toArchive = await prisma.message.findMany({
    where: { createdAt: { lt: cutoff } },
    take: ARCHIVE_BATCH_SIZE,
    orderBy: { createdAt: "asc" },
  });

  if (toArchive.length === 0) {
    return { archived: 0, deleted: 0 };
  }

  await prisma.$transaction(async (tx) => {
    await tx.messageArchive.createMany({
      data: toArchive.map((m) => ({
        id: m.id,
        roomId: m.roomId,
        senderId: m.senderId,
        text: m.text,
        image: m.image,
        createdAt: m.createdAt,
      })),
      skipDuplicates: true,
    });
    await tx.message.deleteMany({
      where: { id: { in: toArchive.map((m) => m.id) } },
    });
  });

  return { archived: toArchive.length, deleted: toArchive.length };
}

/**
 * Copy payments older than `days` into PaymentArchive, then delete them.
 */
export async function archivePaymentsOlderThan(days: number): Promise<{ archived: number; deleted: number }> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const toArchive = await prisma.payment.findMany({
    where: { createdAt: { lt: cutoff } },
    take: ARCHIVE_BATCH_SIZE,
    orderBy: { createdAt: "asc" },
  });

  if (toArchive.length === 0) {
    return { archived: 0, deleted: 0 };
  }

  await prisma.$transaction(async (tx) => {
    await tx.paymentArchive.createMany({
      data: toArchive.map((p) => ({
        id: p.id,
        userId: p.userId,
        planId: p.planId,
        amount: p.amount,
        receiptUrl: p.receiptUrl,
        paymentMethod: p.paymentMethod,
        status: p.status,
        rejectionReason: p.rejectionReason,
        approvedAt: p.approvedAt,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      skipDuplicates: true,
    });
    await tx.payment.deleteMany({
      where: { id: { in: toArchive.map((p) => p.id) } },
    });
  });

  return { archived: toArchive.length, deleted: toArchive.length };
}
