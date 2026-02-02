# Payment System Overview

## Two flows

### 1. Pay-first (new users)
- **Entry**: Pricing → choose plan → `/upload-proof` (or `/payment-instructions/[slug]` then upload).
- **Data**: User uploads receipt image; a **Payment** record is created (status `pending`).
- **Admin**: Dashboard → Admin → Pending payments → **Pay-first payments** → Approve/Reject.
- **Actions**: `app/upload-proof/actions.ts` (submit); `app/dashboard/admin/payments/actions-payment.ts` (approve/reject).
- **On approve**: Payment → `approved`; User gets `subscriptionStatus: active`, `currentPlan`, `subscriptionStartDate`, `subscriptionEndDate`, `subscriptionPlanId`; EscortProfile → `approved`. A **Subscription** row is now also created so expiration cron and escort plan resolution work consistently.

### 2. Subscription upgrade (existing users)
- **Entry**: `/upgrade` → choose plan → upload proof.
- **Data**: A **Subscription** record is created (status `pending`) with `paymentProofUrl`.
- **Admin**: Dashboard → Admin → Pending payments → **Subscription upgrades** → Approve/Reject.
- **Actions**: `app/upgrade/actions.ts` (submit); `app/dashboard/admin/payments/actions.ts` (approve/reject).
- **On approve**: Subscription → `active`, start/end dates set; User updated; EscortProfile approved; optional email for auto-renew.

## Models

- **Payment**: One-off payment proof (pay-first). Links to User and SubscriptionPlan. Status: pending | approved | rejected.
- **Subscription**: Upgrade or pay-first (after fix). Links to User and optional SubscriptionPlan. Status: pending | active | expired | rejected.
- **User**: `subscriptionStatus`, `currentPlan`, `subscriptionStartDate`, `subscriptionEndDate`, `subscriptionPlanId` kept in sync on approval/expiry.
- **DepositPayment**: Booking deposits; separate flow (admin bookings/deposits).

## Access checks

- **viewer-access**: Has active subscription? Checks Subscription table first, then falls back to `User.subscriptionStatus === "active"`.
- **subscription-access.getActiveSubscriptionsForUsers**: Used for escort list plan; reads Subscription table (and User.currentPlan when no Subscription row).
- **subscription-expiration**: Cron expires Subscription rows past grace → updates User and EscortProfile. Pay-first users now have a Subscription row, so they expire correctly.

## Admin pages

- **Pending payments** (`/dashboard/admin/payments`): Two tables — Pay-first payments (Payment), Subscription upgrades (Subscription). Uses cursor pagination (100 per table).
- **Payment accounts** (`/dashboard/admin/payment-accounts`): Bank/TeleBirr accounts shown on payment-instructions.

## Issues fixed

1. **Pay-first plan not shown**: Escort list used only `user.subscriptions[0]`; pay-first users had no Subscription row so they showed as Normal. Fixed by using `user.currentPlan` when no Subscription row and by creating a Subscription row when approving a Payment.
2. **Pay-first never expired**: Cron only expires Subscription rows; pay-first users had none. Fixed by creating a Subscription (active) when approving a Payment so they get an endDate and cron can expire them.
