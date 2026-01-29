import { prisma } from "@/lib/db";

export type PaymentAccountDoc = {
  id: string;
  type: "bank" | "mobile_money";
  accountName: string;
  accountNumber: string;
  provider: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

/** Active payment accounts for payment-instructions page, ordered by displayOrder. */
export async function getActivePaymentAccounts(): Promise<PaymentAccountDoc[]> {
  const rows = await prisma.paymentAccount.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type as "bank" | "mobile_money",
    accountName: r.accountName,
    accountNumber: r.accountNumber,
    provider: r.provider,
    displayOrder: r.displayOrder,
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

/** All payment accounts for admin CRUD. */
export async function getAllPaymentAccountsForAdmin(): Promise<PaymentAccountDoc[]> {
  const rows = await prisma.paymentAccount.findMany({
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type as "bank" | "mobile_money",
    accountName: r.accountName,
    accountNumber: r.accountNumber,
    provider: r.provider,
    displayOrder: r.displayOrder,
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}
