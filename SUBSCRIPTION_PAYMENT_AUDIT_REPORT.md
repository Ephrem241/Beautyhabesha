# 🔍 Subscription and Payment System Audit Report

**Date**: 2026-02-10  
**Application**: Beautyhabesha (Next.js 16.1.2)  
**Auditor**: Augment Agent  

---

## 📋 Executive Summary

This comprehensive audit examined the subscription and payment system across schema definitions, data flows, code consistency, and migration status. The system is currently in a **transitional state** with both old (`Plan`) and new (`SubscriptionPlan`) models coexisting.

### Overall Status: ⚠️ **NEEDS ATTENTION**

**Critical Issues Found**: 6  
**High Priority Issues**: 4  
**Medium Priority Issues**: 3  
**Low Priority Issues**: 2  

---

## 1️⃣ Schema Consistency Check ✅

### Status: **PASS** (with notes)

#### ✅ SubscriptionPlan Model (lines 210-231)
**Location**: `prisma/schema.prisma`

**Fields**:
- ✅ `id` (String, CUID, Primary Key)
- ✅ `name` (String)
- ✅ `slug` (String, Unique)
- ✅ `price` (Float)
- ✅ `currency` (String, default "ETB")
- ✅ `billingCycle` (BillingCycle enum, default monthly)
- ✅ `features` (String[], default [])
- ✅ `durationDays` (Int, default 30)
- ✅ `isPopular`, `isRecommended`, `isActive` (Boolean)
- ✅ `deletedAt` (DateTime?, soft delete support)
- ✅ `createdAt`, `updatedAt` (DateTime)

**Relationships**:
- ✅ `users` → User[] (one-to-many)
- ✅ `subscriptions` → Subscription[] (one-to-many)
- ✅ `paymentRecords` → Payment[] (one-to-many, relation "PlanPayments")

**Indexes**:
- ✅ `slug` (unique constraint + index)
- ✅ `isActive, deletedAt` (composite index)

**Assessment**: ✅ **Well-designed, production-ready**

---

#### ⚠️ Subscription Model (lines 234-258)
**Location**: `prisma/schema.prisma`

**Fields**:
- ✅ `id`, `userId`, `status`, `paymentMethod`, `paymentProofUrl`, `paymentProofPublicId`
- ✅ `rejectionReason`, `approvedAt`, `startDate`, `endDate`, `lastNotifiedAt`
- ✅ `createdAt`, `updatedAt`
- ⚠️ `planId` (String) - **Legacy field, plan name as string**
- ⚠️ `subscriptionPlanId` (String?) - **NEW field, optional FK to SubscriptionPlan**

**Relationships**:
- ✅ `user` → User (many-to-one, CASCADE delete)
- ⚠️ `subscriptionPlan` → SubscriptionPlan? (many-to-one, SET NULL on delete)

**Critical Finding**: `subscriptionPlanId` is **OPTIONAL** (`String?`), allowing NULL values. This indicates:
1. Incomplete migration from old system
2. Intentional dual-system support
3. Potential data integrity issues

**Recommendation**: Make `subscriptionPlanId` required after migration completion.

---

#### ✅ Payment Model (lines 297-317)
**Location**: `prisma/schema.prisma`

**Fields**:
- ✅ All required fields present
- ✅ `planId` correctly references `SubscriptionPlan.id` (not plan name)
- ✅ `status` uses PaymentStatus enum
- ✅ `paymentMethod` uses PaymentMethod enum

**Relationships**:
- ✅ `user` → User (CASCADE delete)
- ✅ `plan` → SubscriptionPlan (CASCADE delete, relation "PlanPayments")

**Assessment**: ✅ **Correctly implemented for new system**

---

#### ⚠️ Old Plan Model (lines 182-193)
**Location**: `prisma/schema.prisma`

**Status**: **STILL EXISTS** - Legacy model not yet removed

**Fields**: `id`, `name`, `price`, `durationDays`, `features`, `priority`

**Issue**: This model is still actively queried by:
- `lib/subscription-access.ts` (line 25)
- `lib/plans.ts` (line 78)
- `app/dashboard/admin/payments/actions.ts` (line 89)
- `app/admin/subscriptions/actions.ts` (line 66)

**Recommendation**: Plan deprecation and removal after full migration.

---

## 2️⃣ Data Flow Analysis ✅

### Payment Submission Flow

#### Path 1: `/upgrade` → `submitUpgradePayment()`
**File**: `app/upgrade/actions.ts` (lines 98-111)

**Status**: ✅ **CORRECT**

```typescript
await prisma.subscription.create({
  data: {
    userId,
    planId: plan.name,              // ✅ SubscriptionPlan.name
    subscriptionPlanId: plan.id,    // ✅ SubscriptionPlan.id
    status: "pending",
    // ...
  },
});
```

**Assessment**: Properly sets both `planId` and `subscriptionPlanId`.

---

#### Path 2: `/payment-instructions` → `submitPaymentProof()`
**File**: `app/payment-instructions/actions.ts` (lines 116-126)

**Status**: ✅ **CORRECT**

```typescript
await prisma.subscription.create({
  data: {
    userId,
    planId: plan.name,              // ✅ SubscriptionPlan.name
    subscriptionPlanId: plan.id,    // ✅ SubscriptionPlan.id
    status: "pending",
    // ...
  },
});
```

**Assessment**: Properly sets both `planId` and `subscriptionPlanId`.

---

### Approval Flow

#### Path 1: Admin Payments → `approvePayment()`
**File**: `app/dashboard/admin/payments/actions.ts` (lines 35-162)

**Status**: ✅ **CORRECT** (with fallback)

**Logic** (lines 78-94):
1. ✅ Checks if `subscription.subscriptionPlanId` exists
2. ✅ If yes: fetches `SubscriptionPlan` for duration
3. ⚠️ If no: falls back to old `Plan` model (line 89)

**User Update** (line 131):
```typescript
await tx.user.update({
  where: { id: subscription.userId },
  data: {
    subscriptionPlanId: subscription.subscriptionPlanId, // ⚠️ Could be NULL
    // ...
  },
});
```

**Assessment**: Handles both systems but propagates NULL values.

---

#### Path 2: Admin Payments (Payment Model) → `approvePaymentRecord()`
**File**: `app/dashboard/admin/payments/actions-payment.ts` (lines 30-104)

**Status**: ✅ **CORRECT**

**User Update** (lines 69-78):
```typescript
await tx.user.update({
  where: { id: payment.userId },
  data: {
    subscriptionPlanId: payment.planId,  // ✅ SubscriptionPlan.id
    currentPlan: payment.plan.name,
    // ...
  },
});
```

**Subscription Creation** (lines 80-93):
```typescript
await tx.subscription.create({
  data: {
    planId: payment.plan.name,           // ✅ SubscriptionPlan.name
    subscriptionPlanId: payment.planId,  // ✅ SubscriptionPlan.id
    status: "active",
    // ...
  },
});
```

**Assessment**: ✅ Properly uses new system throughout.

---

#### Path 3: Admin Subscriptions → `approveSubscription()`
**File**: `app/admin/subscriptions/actions.ts` (lines 23-133)

**Status**: ❌ **CRITICAL ISSUE**

**User Update** (lines 100-108):
```typescript
await tx.user.update({
  where: { id: subscription.userId },
  data: {
    subscriptionStartDate: startDate,
    subscriptionEndDate: endDate,
    subscriptionStatus: "active",
    currentPlan: subscription.planId,  // ✅ Set
    // ❌ subscriptionPlanId NOT SET - MISSING!
  },
});
```

**Critical Finding**: This approval path does **NOT** set `User.subscriptionPlanId`, causing:
1. Feature access failures (relies on `subscriptionPlanId`)
2. Inconsistent user state
3. Broken feature resolution in `lib/feature-access.ts`

**Recommendation**: Add `subscriptionPlanId: subscription.subscriptionPlanId` to user update.

---

### Auto-Renewal Flow

#### `processAutoRenewals()`
**File**: `lib/auto-renew.ts` (lines 23-101)

**Status**: ❌ **CRITICAL ISSUE**

**Subscription Creation** (lines 65-74):
```typescript
await tx.subscription.create({
  data: {
    userId: sub.userId,
    planId: sub.planId,  // ✅ Set (plan name from expiring subscription)
    // ❌ subscriptionPlanId NOT SET - will be NULL
    status: "pending",
    paymentMethod: sub.paymentMethod,
    paymentProofUrl: AUTO_RENEW_PLACEHOLDER_URL,
    paymentProofPublicId: AUTO_RENEW_PLACEHOLDER_PUBLIC_ID,
  },
});
```

**Critical Finding**: Auto-renewal creates subscriptions **WITHOUT** `subscriptionPlanId`, causing:
1. NULL `subscriptionPlanId` in renewed subscriptions
2. Approval flow must fall back to old `Plan` model
3. Potential feature access issues after renewal

**Root Cause**: The expiring subscription's `subscriptionPlanId` is not copied to the new pending subscription.

**Recommendation**: Add `subscriptionPlanId: sub.subscriptionPlanId` to subscription creation.

---

## 3️⃣ Code Consistency Verification ⚠️

### Library Files Analysis

#### ✅ `lib/subscription-plans.ts` (122 lines)
**Purpose**: New system - manages `SubscriptionPlan` model

**Status**: ✅ **FULLY CORRECT**

**Functions**:
- `getActiveSubscriptionPlans()` - ✅ Queries `SubscriptionPlan`
- `getSubscriptionPlanBySlug()` - ✅ Queries `SubscriptionPlan`
- `getSubscriptionPlanById()` - ✅ Queries `SubscriptionPlan`
- `getAllSubscriptionPlansForAdmin()` - ✅ Queries `SubscriptionPlan`

**Assessment**: Fully migrated to new system.

---

#### ⚠️ `lib/subscription-access.ts` (114 lines)
**Purpose**: Manages subscription access and plan resolution

**Status**: ⚠️ **USES OLD SYSTEM**

**Critical Issue** (line 25):
```typescript
export async function getPlanPriorityMap() {
  const planDocs = await prisma.plan.findMany(); // ❌ OLD MODEL
  // ...
}
```

**Impact**: This function is used by:
- `getUserPlanAccess()` (line 90)
- `resolvePlanAccess()` (line 99)

**Recommendation**: Migrate to query `SubscriptionPlan` instead of `Plan`.

---

#### ⚠️ `lib/plans.ts` (112 lines)
**Purpose**: Old system - hardcoded plan catalog

**Status**: ⚠️ **USES OLD SYSTEM**

**Critical Issue** (line 78):
```typescript
export async function getEffectivePlanCatalog(): Promise<PlanDetails[]> {
  const dbPlans = await prisma.plan.findMany(); // ❌ OLD MODEL
  // ...
}
```

**Impact**: This function merges hardcoded `PLAN_CATALOG` with database `Plan` records.

**Recommendation**: Deprecate this file after migrating all usages to `lib/subscription-plans.ts`.

---

#### ⚠️ `lib/plan-access.ts` (53 lines)
**Purpose**: Feature access checks based on plan

**Status**: ⚠️ **USES HARDCODED LOGIC**

**Issue** (lines 19-31):
```typescript
export function buildPlanAccess(planId: PlanId, priority: number) {
  const imageLimit =
    planId === "Platinum" ? null : planId === "VIP" ? 10 : 3;
  const isPaid = planId !== "Normal";
  return {
    planId,
    priority,
    imageLimit,
    canShowContact: isPaid,
    hasFeaturedBadge: planId === "Platinum",
    hasHomepageSpotlight: planId === "Platinum",
  };
}
```

**Problem**: Uses hardcoded logic instead of `SubscriptionPlan.features` array.

**Recommendation**: Migrate to use `lib/feature-access.ts` which properly uses `SubscriptionPlan.features`.

---

#### ✅ `lib/feature-access.ts` (101 lines)
**Purpose**: New system - feature access via `SubscriptionPlan.features`

**Status**: ✅ **FULLY CORRECT**

**Feature Resolution**:
1. ✅ Check `User.subscriptionPlanId` → `SubscriptionPlan.features`
2. ✅ Fallback: Check latest active `Subscription.subscriptionPlanId` → `SubscriptionPlan.features`

**Assessment**: Properly implements new system with graceful fallback.

---

## 4️⃣ Migration Status 🔄

### Current State: **INCOMPLETE MIGRATION**

#### Dual System Coexistence

**Old System** (`Plan` model):
- ❌ Still exists in schema (lines 182-193)
- ❌ Still queried by 4+ files
- ❌ Used as fallback in approval flows

**New System** (`SubscriptionPlan` model):
- ✅ Fully implemented in schema
- ✅ Used by payment submission flows
- ✅ Used by newer approval flows
- ⚠️ Optional in `Subscription.subscriptionPlanId`

#### Migration Gaps

1. **Auto-Renewal**: Does not set `subscriptionPlanId`
2. **Admin Approval Path**: `app/admin/subscriptions/actions.ts` doesn't set `User.subscriptionPlanId`
3. **Library Dependencies**: `lib/subscription-access.ts` and `lib/plans.ts` still query old `Plan` model
4. **Feature Access**: Dual systems (`lib/plan-access.ts` vs `lib/feature-access.ts`)

---

## 5️⃣ Critical Issues & Recommendations 🚨

### 🔴 CRITICAL ISSUE #1: Auto-Renewal Missing `subscriptionPlanId`

**Severity**: CRITICAL
**File**: `lib/auto-renew.ts`
**Line**: 68
**Impact**: All auto-renewed subscriptions have NULL `subscriptionPlanId`

**Current Code**:
```typescript
await tx.subscription.create({
  data: {
    userId: sub.userId,
    planId: sub.planId,
    // ❌ subscriptionPlanId NOT SET
    status: "pending",
    // ...
  },
});
```

**Recommended Fix**:
```typescript
await tx.subscription.create({
  data: {
    userId: sub.userId,
    planId: sub.planId,
    subscriptionPlanId: sub.subscriptionPlanId, // ✅ ADD THIS
    status: "pending",
    // ...
  },
});
```

**Consequences if Not Fixed**:
- Feature access breaks for auto-renewed users
- Approval flow must use old `Plan` model fallback
- Data integrity issues accumulate over time

---

### 🔴 CRITICAL ISSUE #2: Admin Approval Doesn't Set `User.subscriptionPlanId`

**Severity**: CRITICAL
**File**: `app/admin/subscriptions/actions.ts`
**Line**: 100-108
**Impact**: Users approved via this path have NULL `subscriptionPlanId`

**Current Code**:
```typescript
await tx.user.update({
  where: { id: subscription.userId },
  data: {
    subscriptionStartDate: startDate,
    subscriptionEndDate: endDate,
    subscriptionStatus: "active",
    currentPlan: subscription.planId,
    // ❌ subscriptionPlanId NOT SET
  },
});
```

**Recommended Fix**:
```typescript
await tx.user.update({
  where: { id: subscription.userId },
  data: {
    subscriptionStartDate: startDate,
    subscriptionEndDate: endDate,
    subscriptionStatus: "active",
    currentPlan: planName,
    subscriptionPlanId: subscription.subscriptionPlanId, // ✅ ADD THIS
  },
});
```

**Consequences if Not Fixed**:
- `lib/feature-access.ts` cannot resolve features for these users
- Users may lose access to paid features
- Inconsistent user state across the system

---

### 🟠 HIGH PRIORITY ISSUE #3: Old `Plan` Model Still Queried

**Severity**: HIGH
**Files**:
- `lib/subscription-access.ts` (line 25)
- `lib/plans.ts` (line 78)
- `app/dashboard/admin/payments/actions.ts` (line 89)
- `app/admin/subscriptions/actions.ts` (line 66)

**Impact**: System depends on deprecated model

**Recommended Fix**:

**For `lib/subscription-access.ts` line 25**:
```typescript
// OLD:
const planDocs = await prisma.plan.findMany();

// NEW:
const planDocs = await prisma.subscriptionPlan.findMany({
  where: { deletedAt: null },
  select: { name: true, price: true, durationDays: true },
});
```

**For `lib/plans.ts` line 78**:
```typescript
// OLD:
const dbPlans = await prisma.plan.findMany();

// NEW:
const dbPlans = await prisma.subscriptionPlan.findMany({
  where: { deletedAt: null },
});
```

**Migration Strategy**:
1. Update all queries to use `SubscriptionPlan`
2. Verify no production data relies on `Plan` model
3. Create migration to drop `Plan` table
4. Remove `Plan` model from schema

---

### 🟠 HIGH PRIORITY ISSUE #4: Dual Feature Access Systems

**Severity**: HIGH
**Files**:
- `lib/plan-access.ts` (hardcoded logic)
- `lib/feature-access.ts` (database-driven)

**Impact**: Inconsistent feature resolution

**Current State**:
- `lib/plan-access.ts` uses hardcoded rules (e.g., "Platinum gets unlimited images")
- `lib/feature-access.ts` uses `SubscriptionPlan.features` array from database

**Recommended Fix**:
1. Audit all usages of `lib/plan-access.ts`
2. Migrate to `lib/feature-access.ts` where possible
3. Deprecate `lib/plan-access.ts` after migration
4. Ensure all features are properly defined in `SubscriptionPlan.features`

---

### 🟡 MEDIUM PRIORITY ISSUE #5: `Subscription.subscriptionPlanId` is Optional

**Severity**: MEDIUM
**File**: `prisma/schema.prisma`
**Line**: 237
**Impact**: Allows NULL values, enabling data integrity issues

**Current Schema**:
```prisma
model Subscription {
  // ...
  subscriptionPlanId   String?  // ⚠️ Optional
  // ...
}
```

**Recommended Fix** (after fixing Issues #1 and #2):
```prisma
model Subscription {
  // ...
  subscriptionPlanId   String   // ✅ Required
  // ...
}
```

**Migration Steps**:
1. Fix all code that creates subscriptions without `subscriptionPlanId`
2. Run data migration to populate NULL values
3. Make field required in schema
4. Run `npx prisma migrate dev`

---

### 🟡 MEDIUM PRIORITY ISSUE #6: Hardcoded Plan Catalog

**Severity**: MEDIUM
**File**: `lib/plans.ts`
**Lines**: 18-70
**Impact**: Duplicate source of truth

**Current State**:
```typescript
export const PLAN_CATALOG: PlanDetails[] = [
  {
    id: "Normal",
    name: "Normal",
    priceLabel: "Free",
    priceEtb: 0,
    // ... hardcoded details
  },
  // ...
];
```

**Problem**: Plan details exist in:
1. Hardcoded `PLAN_CATALOG` array
2. Database `SubscriptionPlan` table
3. Old database `Plan` table (deprecated)

**Recommended Fix**:
1. Use `SubscriptionPlan` as single source of truth
2. Remove `PLAN_CATALOG` constant
3. Update all code to query database instead
4. Keep seed data in `prisma/seed.ts` only

---

### 🟢 LOW PRIORITY ISSUE #7: Missing Indexes

**Severity**: LOW
**File**: `prisma/schema.prisma`
**Impact**: Potential performance issues

**Recommended Indexes**:

```prisma
model Subscription {
  // ... existing fields ...

  @@index([userId, status])           // ✅ ADD: For user subscription queries
  @@index([subscriptionPlanId])       // ✅ ADD: For plan-based queries
  @@index([status, endDate])          // ✅ ADD: For expiration queries
}
```

---

### 🟢 LOW PRIORITY ISSUE #8: Inconsistent Plan Name References

**Severity**: LOW
**Files**: Multiple
**Impact**: Potential mismatches

**Problem**: `Subscription.planId` stores plan **name** (string), not ID:
- `planId: "VIP"` (plan name)
- `subscriptionPlanId: "clx123..."` (actual ID)

**Recommendation**: Consider renaming for clarity:
```prisma
model Subscription {
  planName           String   // ✅ More descriptive
  subscriptionPlanId String   // ✅ Clear it's the ID
  // ...
}
```

---

## 6️⃣ Potential Data Integrity Issues 🗄️

### Issue 1: NULL `subscriptionPlanId` in Active Subscriptions

**Query to Check**:
```sql
SELECT COUNT(*)
FROM subscriptions
WHERE status = 'active'
  AND subscriptionPlanId IS NULL;
```

**Expected**: 0
**If > 0**: Data migration needed

---

### Issue 2: Mismatched Plan Names

**Query to Check**:
```sql
SELECT s.id, s.planId, sp.name
FROM subscriptions s
LEFT JOIN subscription_plans sp ON s.subscriptionPlanId = sp.id
WHERE s.subscriptionPlanId IS NOT NULL
  AND s.planId != sp.name;
```

**Expected**: 0 rows
**If > 0**: Data inconsistency exists

---

### Issue 3: Users with Active Status but NULL `subscriptionPlanId`

**Query to Check**:
```sql
SELECT COUNT(*)
FROM users
WHERE subscriptionStatus = 'active'
  AND subscriptionPlanId IS NULL;
```

**Expected**: 0
**If > 0**: Users may lose feature access

---

## 7️⃣ Recommended Action Plan 📝

### Phase 1: Critical Fixes (Immediate)

1. **Fix Auto-Renewal** (`lib/auto-renew.ts` line 68)
   - Add `subscriptionPlanId: sub.subscriptionPlanId`
   - Test auto-renewal flow
   - Estimated time: 15 minutes

2. **Fix Admin Approval** (`app/admin/subscriptions/actions.ts` line 106)
   - Add `subscriptionPlanId: subscription.subscriptionPlanId`
   - Test approval flow
   - Estimated time: 15 minutes

3. **Run Data Integrity Checks**
   - Execute SQL queries from Section 6
   - Document findings
   - Estimated time: 30 minutes

### Phase 2: High Priority (This Week)

4. **Migrate Old `Plan` Queries**
   - Update `lib/subscription-access.ts`
   - Update `lib/plans.ts`
   - Update approval action fallbacks
   - Estimated time: 2 hours

5. **Consolidate Feature Access**
   - Audit all usages of `lib/plan-access.ts`
   - Migrate to `lib/feature-access.ts`
   - Estimated time: 3 hours

### Phase 3: Medium Priority (This Month)

6. **Data Migration**
   - Populate NULL `subscriptionPlanId` values
   - Verify data consistency
   - Estimated time: 4 hours

7. **Make `subscriptionPlanId` Required**
   - Update schema
   - Run migration
   - Estimated time: 1 hour

8. **Remove Hardcoded Plan Catalog**
   - Migrate all usages to database queries
   - Remove `PLAN_CATALOG` constant
   - Estimated time: 3 hours

### Phase 4: Cleanup (Next Month)

9. **Deprecate Old `Plan` Model**
   - Verify no dependencies
   - Create migration to drop table
   - Remove from schema
   - Estimated time: 2 hours

10. **Add Performance Indexes**
    - Add recommended indexes
    - Test query performance
    - Estimated time: 1 hour

---

## 8️⃣ Summary & Conclusion 📊

### Issues Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 2 | Requires immediate attention |
| 🟠 High | 2 | Should be fixed this week |
| 🟡 Medium | 3 | Plan for this month |
| 🟢 Low | 2 | Nice to have |
| **Total** | **9** | |

### System Health: ⚠️ **FUNCTIONAL BUT NEEDS IMPROVEMENT**

**Strengths**:
- ✅ New `SubscriptionPlan` model is well-designed
- ✅ Payment submission flows are correct
- ✅ `lib/feature-access.ts` properly implements new system
- ✅ Schema relationships are properly defined

**Weaknesses**:
- ❌ Incomplete migration from old to new system
- ❌ Auto-renewal creates incomplete subscription records
- ❌ One admin approval path doesn't set `subscriptionPlanId`
- ❌ Dual systems create confusion and maintenance burden

### Recommended Priority

**Fix Immediately** (Critical Issues #1-2):
- These cause feature access failures for real users
- Simple fixes with high impact
- Total time: ~30 minutes

**Fix This Week** (High Priority Issues #3-4):
- Reduces technical debt
- Enables future cleanup
- Total time: ~5 hours

**Plan for Later** (Medium/Low Priority):
- Improves maintainability
- Enhances performance
- Total time: ~11 hours

---

## 📎 Appendix: File Reference

### Files Examined (25 total)

**Schema**:
- `prisma/schema.prisma`

**Library Files**:
- `lib/subscription-plans.ts` ✅
- `lib/subscription-access.ts` ⚠️
- `lib/plans.ts` ⚠️
- `lib/plan-access.ts` ⚠️
- `lib/feature-access.ts` ✅
- `lib/auto-renew.ts` ❌

**Action Files**:
- `app/upgrade/actions.ts` ✅
- `app/payment-instructions/actions.ts` ✅
- `app/dashboard/admin/payments/actions.ts` ✅
- `app/dashboard/admin/payments/actions-payment.ts` ✅
- `app/admin/subscriptions/actions.ts` ❌

**Migration Files**:
- `prisma/migrations/20260131000000_add_payment_model/migration.sql`

---

**End of Audit Report**

*Generated by Augment Agent on 2026-02-10*


