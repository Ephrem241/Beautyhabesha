# Server Actions Security Audit

## Overview

This document tracks the security status of all Server Actions in the application.

## Security Checklist

For each Server Action, verify:
- ✅ **Input Validation**: Uses Zod schema validation
- ✅ **Authentication**: Checks user is logged in
- ✅ **Authorization**: Verifies user has permission (ownership/role)
- ✅ **Rate Limiting**: Prevents abuse (especially for sensitive operations)
- ✅ **Error Handling**: Doesn't expose internal errors to client

## Server Actions Inventory

### 1. Payment & Subscription Actions

#### `app/payment-instructions/actions.ts`
- **Function**: `submitPaymentProof`
- **Status**: ⚠️ **NEEDS RATE LIMITING**
- ✅ Input Validation: Zod schema
- ✅ Authentication: Checks session
- ✅ Authorization: User can only submit for themselves
- ❌ Rate Limiting: **MISSING** - vulnerable to spam
- ✅ Error Handling: Returns user-friendly errors

**Recommendation**: Add rate limiting (max 5 submissions per hour)

#### `app/upload-proof/actions.ts`
- **Function**: `submitPaymentProof`
- **Status**: ⚠️ **NEEDS RATE LIMITING**
- ✅ Input Validation: Zod schema
- ✅ Authentication: Redirects if not logged in
- ✅ Authorization: User can only submit for themselves
- ❌ Rate Limiting: **MISSING** - vulnerable to spam
- ✅ Error Handling: Returns user-friendly errors

**Recommendation**: Add rate limiting (max 5 submissions per hour)

#### `app/upgrade/actions.ts`
- **Function**: `submitUpgradePayment`
- **Status**: ⚠️ **NEEDS RATE LIMITING**
- ✅ Input Validation: Zod schema
- ✅ Authentication: Checks session
- ✅ Authorization: User can only upgrade themselves
- ❌ Rate Limiting: **MISSING** - vulnerable to spam
- ✅ Error Handling: Returns user-friendly errors

**Recommendation**: Add rate limiting (max 5 submissions per hour)

### 2. Escort Profile Actions

#### `app/escort/profile/actions.ts`
- **Function**: `upsertEscortProfile`
- **Status**: ✅ **SECURE** (could add rate limiting)
- ✅ Input Validation: Zod schema
- ✅ Authentication: `requireEscort()` helper
- ✅ Authorization: Escort role required
- ⚠️ Rate Limiting: Not critical but recommended
- ✅ Error Handling: Returns user-friendly errors

**Recommendation**: Add rate limiting (max 10 updates per hour)

### 3. Admin Actions

#### `app/dashboard/admin/users/actions.ts`
- **Functions**: `updateUserRole`, `banUser`, `unbanUser`
- **Status**: ✅ **SECURE**
- ✅ Input Validation: Zod schema
- ✅ Authentication: `requireAdmin()` helper
- ✅ Authorization: Admin role required
- ✅ Rate Limiting: Not critical (admin only)
- ✅ Error Handling: Returns user-friendly errors

**Recommendation**: No changes needed

#### `app/dashboard/admin/escorts/create/actions.ts`
- **Function**: `createEscortAccount`
- **Status**: ✅ **SECURE**
- ✅ Input Validation: Zod schema
- ✅ Authentication: Admin check
- ✅ Authorization: Admin role required
- ✅ Rate Limiting: Not critical (admin only)
- ✅ Error Handling: Returns user-friendly errors

**Recommendation**: No changes needed

### 4. Booking Actions

#### `app/booking/actions.ts`
- **Functions**: `createBooking`, `submitDeposit`, `acceptBooking`, `completeBooking`
- **Status**: ⚠️ **NEEDS RATE LIMITING**
- ✅ Input Validation: Zod schema
- ✅ Authentication: Checks session
- ✅ Authorization: Verifies ownership/role
- ❌ Rate Limiting: **MISSING** - vulnerable to spam bookings
- ✅ Error Handling: Returns user-friendly errors

**Recommendation**: Add rate limiting (max 10 bookings per hour)

## Priority Actions

### Immediate (This Week)
1. ✅ Create `lib/server-action-security.ts` utility
2. ⚠️ Add rate limiting to payment submission actions
3. ⚠️ Add rate limiting to booking actions

### Short-term (This Month)
4. ⚠️ Add rate limiting to profile update actions
5. ✅ Document security patterns for future actions
6. ⚠️ Add monitoring/logging for failed auth attempts

## Rate Limiting Configuration

Recommended limits by action type:

| Action Type | Max Requests | Window | Reason |
|------------|--------------|--------|---------|
| Payment Submission | 5 | 1 hour | Prevent spam/fraud |
| Booking Creation | 10 | 1 hour | Prevent spam bookings |
| Profile Updates | 10 | 1 hour | Prevent abuse |
| Login Attempts | 5 | 15 min | Prevent brute force |
| Password Reset | 3 | 1 hour | Prevent enumeration |

## Security Utility Usage

For new Server Actions, use the `createSecureAction` helper:

```typescript
'use server'

import { z } from 'zod'
import { createSecureAction } from '@/lib/server-action-security'

const MyActionSchema = z.object({
  userId: z.string().uuid(),
})

export const myAction = createSecureAction(
  MyActionSchema,
  async (input, session) => {
    // Your logic here
    return { success: true }
  },
  {
    requireAuth: true,
    requireRole: 'admin', // optional
    rateLimit: { max: 10, window: 60000 }, // optional
  }
)
```

## Next Steps

1. Add rate limiting to payment and booking actions
2. Monitor rate limit violations in logs
3. Consider adding CAPTCHA for public-facing actions
4. Implement IP-based rate limiting for unauthenticated actions
5. Add comprehensive logging for security events

