/**
 * Server Action Security Utilities
 * 
 * Provides reusable security patterns for Next.js Server Actions:
 * - Input validation with Zod
 * - Authentication checks
 * - Authorization checks
 * - Rate limiting
 * 
 * Usage:
 * ```typescript
 * 'use server'
 * 
 * import { z } from 'zod'
 * import { createSecureAction } from '@/lib/server-action-security'
 * 
 * const DeleteUserSchema = z.object({
 *   userId: z.string().uuid(),
 * })
 * 
 * export const deleteUser = createSecureAction(
 *   DeleteUserSchema,
 *   async (input, session) => {
 *     // Authorization: verify ownership
 *     if (input.userId !== session.user.id && session.user.role !== 'admin') {
 *       throw new Error('Forbidden')
 *     }
 *     
 *     await db.user.delete({ where: { id: input.userId } })
 *     return { success: true }
 *   }
 * )
 * ```
 */

import { z } from "zod";
import { getAuthSession } from "@/lib/auth";
import { rateLimitCheck } from "@/lib/rate-limit";
import type { Session } from "next-auth";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Create a secure server action with automatic validation, auth, and rate limiting
 */
export function createSecureAction<TInput, TOutput>(
  schema: z.ZodSchema<TInput>,
  handler: (input: TInput, session: Session) => Promise<TOutput>,
  options: {
    requireAuth?: boolean;
    requireRole?: "admin" | "escort" | "user";
    rateLimit?: { max: number; window: number }; // max requests per window (ms)
  } = {}
) {
  const {
    requireAuth = true,
    requireRole,
    rateLimit: rateLimitConfig,
  } = options;

  return async (rawInput: unknown): Promise<ActionResult<TOutput>> => {
    try {
      // 1. Input Validation
      const result = schema.safeParse(rawInput);
      if (!result.success) {
        return {
          success: false,
          error: `Invalid input: ${result.error.issues.map((e: z.ZodIssue) => e.message).join(", ")}`,
        };
      }

      // 2. Authentication Check
      const session = await getAuthSession();
      if (requireAuth && !session?.user) {
        return {
          success: false,
          error: "Unauthorized: Please log in",
        };
      }

      // 3. Role-based Authorization
      if (requireRole && session?.user.role !== requireRole) {
        return {
          success: false,
          error: `Forbidden: Requires ${requireRole} role`,
        };
      }

      // 4. Rate Limiting
      if (rateLimitConfig && session?.user) {
        const identifier = `action:${handler.name}:${session.user.id}`;
        const rateLimitResult = rateLimitCheck(identifier, {
          max: rateLimitConfig.max,
          windowMs: rateLimitConfig.window,
        });

        if (!rateLimitResult.ok) {
          return {
            success: false,
            error: `Rate limit exceeded. Please try again in ${rateLimitResult.retryAfter} seconds.`,
          };
        }
      }

      // 5. Execute Handler
      const data = await handler(result.data, session!);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("[Server Action Error]", error);

      // Don't expose internal errors to client
      const message =
        error instanceof Error ? error.message : "Internal server error";

      return {
        success: false,
        error: message,
      };
    }
  };
}

/**
 * Verify user owns a resource
 */
export async function verifyOwnership(
  userId: string,
  resourceOwnerId: string,
  session: Session | null
): Promise<boolean> {
  if (!session?.user) return false;

  // Admins can access everything
  if (session.user.role === "admin") return true;

  // User must own the resource
  return session.user.id === resourceOwnerId;
}

/**
 * Require admin role
 */
export async function requireAdmin(session: Session | null): Promise<boolean> {
  return session?.user?.role === "admin";
}

/**
 * Require escort role
 */
export async function requireEscort(session: Session | null): Promise<boolean> {
  return session?.user?.role === "escort" || session?.user?.role === "admin";
}

