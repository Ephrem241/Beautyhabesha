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
  // Release connections before Neon idle disconnect (~5min) so we don't reuse dead connections
  idleTimeoutMillis: 45000,
  // Cold start / slow network: allow up to 90s per connection attempt
  connectionTimeoutMillis: 90000,
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

// Transient DB error messages / codes to retry on (Neon closes idle connections → P1017)
const TRANSIENT_ERROR_MESSAGES = [
  "connection terminated unexpectedly",
  "connection terminated due to connection timeout",
  "server has closed the connection",
  "econnreset",
  "connection reset by peer",
  "terminating connection due to administrator command",
  "p1017",
];

// Retry logic extension (longer backoff for Neon cold starts / connection timeout)
const prismaWithRetry = basePrisma.$extends({
  name: "retry-logic",
  query: {
    async $allOperations({ model, operation, args, query }) {
      const maxAttempts = 5;
      let attempt = 0;

      while (true) {
        try {
          const result = await query(args);
          return result;
        } catch (err: unknown) {
          attempt += 1;

          // Safely extract message/code from unknown error
          let rawMsg = "";
          let rawCode = "";
          if (typeof err === "string") {
            rawMsg = err;
          } else if (err && typeof err === "object") {
            const e = err as Record<string, unknown>;
            if (typeof e.message === "string") rawMsg = e.message;
            if (typeof e.code === "string") rawCode = e.code;
          } else {
            rawMsg = String(err);
          }

          const msg = rawMsg.toLowerCase();
          const code = rawCode.toLowerCase();

          const matchedList = TRANSIENT_ERROR_MESSAGES.some((t) => msg.includes(t) || code.includes(t));
          const genericTransient = /timeout|connection terminated|connection reset|econnreset/.test(msg) || /timeout|connection terminated|connection reset|econnreset/.test(code);
          const isTransient = matchedList || genericTransient;

          if (!isTransient || attempt >= maxAttempts) throw err;

          // Longer backoff for serverless/cold start: 1s, 2s, 4s, 8s
          const backoffMs = 1000 * Math.pow(2, attempt - 1);
          console.warn(
            `[Prisma retry] transient DB error, attempt ${attempt}/${maxAttempts}, retrying in ${backoffMs}ms: ${rawMsg || rawCode}`
          );
          await new Promise((res) => setTimeout(res, backoffMs));
          // loop to retry
        }
      }
    },
  },
});

export type ExtendedPrisma = typeof prismaWithRetry;

export const prisma =
  globalForPrisma.prisma ??
  (prismaWithRetry as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Retry logic has been moved into the $extends query hook above.

// Legacy function name for compatibility during migration
export default async function connectDb() {
  // Prisma connects automatically, but we keep this for compatibility
  return prisma;
}
