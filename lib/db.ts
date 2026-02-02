import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "@/lib/env";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Use pooled URL for Neon serverless to avoid connection exhaustion.
// Neon: set DATABASE_POOL_URL with ?pgbouncer=true&connection_limit=5 or append to DATABASE_URL.
const connectionString = env.DATABASE_POOL_URL ?? env.DATABASE_URL;
const isNeon = connectionString.includes("neon.tech");
const poolMax = isNeon ? 5 : 10;

const pool = new Pool({
  connectionString,
  max: poolMax,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

// Create adapter with the pool
const adapter = new PrismaPg(pool);

const SLOW_QUERY_MS = 200;

const basePrisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// Extend with slow-query logging: log any query taking longer than SLOW_QUERY_MS
const prismaWithSlowLog = basePrisma.$extends({
  name: "slow-query-log",
  query: {
    $allOperations({ model, operation, args, query }) {
      const start = Date.now();
      return query(args).then((result) => {
        const ms = Date.now() - start;
        if (ms > SLOW_QUERY_MS) {
          console.warn(`[Prisma slow query] ${model ?? "root"}.${operation} took ${ms}ms`);
        }
        return result;
      });
    },
  },
});

export type ExtendedPrisma = typeof prismaWithSlowLog;

export const prisma =
  globalForPrisma.prisma ??
  (prismaWithSlowLog as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Legacy function name for compatibility during migration
export default async function connectDb() {
  // Prisma connects automatically, but we keep this for compatibility
  return prisma;
}
