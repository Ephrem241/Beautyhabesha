# ✅ Model Contact & Photo Access Control Changes

**Date**: 2026-02-11  
**Status**: COMPLETE  

---

## 📊 Summary

Successfully implemented two major security and business logic changes:

1. **Redirect All Model Contact to Admin Contact** - All contact buttons now redirect to admin's Telegram instead of individual model contact info
2. **Restrict Photo Gallery Access to Paid Subscribers** - Only users with active subscriptions can view full-quality photos

---

## 🎯 Change 1: Redirect All Model Contact to Admin Contact

### Problem
Contact buttons on model profile pages were linking to individual model's personal contact information (Telegram, phone), which was not the desired behavior.

### Solution
Modified all contact buttons to redirect to admin's contact information instead.

### Files Modified

#### 1. **`app/profiles/[id]/_components/ContactButton.tsx`**

**Before**:
```typescript
type ContactButtonProps = {
  profileId: string;
  telegram?: string | null;
  phone?: string | null;
  disabled: boolean;
};

const getContactHref = (): string => {
  if (disabled) return "#";
  if (telegram) {
    const handle = telegram.replace(/^@/, "").trim();
    return handle ? `https://t.me/${handle}` : `/chat/${profileId}`;
  }
  if (phone) {
    const digits = phone.replace(/\D/g, "");
    return digits ? `tel:${digits}` : `/chat/${profileId}`;
  }
  return `/chat/${profileId}`;
};
```

**After**:
```typescript
import { DEFAULT_ESCORT_TELEGRAM } from "@/lib/escort-defaults";

type ContactButtonProps = {
  profileId: string;
  disabled: boolean;
};

const getContactHref = (): string => {
  if (disabled) return "#";
  // Always redirect to admin Telegram contact
  const handle = DEFAULT_ESCORT_TELEGRAM.replace(/^@/, "").trim();
  return handle ? `https://t.me/${handle}` : `/chat/${profileId}`;
};
```

**Changes**:
- ✅ Removed `telegram` and `phone` props
- ✅ Added import for `DEFAULT_ESCORT_TELEGRAM` (`@abeni_agent`)
- ✅ Always redirects to admin Telegram contact
- ✅ Fallback to chat if admin contact unavailable

#### 2. **`app/profiles/[id]/_components/ProfileDetailView.tsx`**

**Before**:
```typescript
<ContactButton
  profileId={profile.id}
  displayName={profile.displayName}
  telegram={profile.contact?.telegram}
  phone={profile.contact?.phone}
  disabled={!canShowContact}
/>
```

**After**:
```typescript
<ContactButton
  profileId={profile.id}
  disabled={!canShowContact}
/>
```

**Changes**:
- ✅ Removed `displayName`, `telegram`, and `phone` props
- ✅ Simplified to only pass `profileId` and `disabled`

### Impact
- ✅ **All profile contact buttons** now redirect to `@abeni_agent` (admin Telegram)
- ✅ **Consistent contact flow** - users always contact admin, not individual models
- ✅ **Maintained UI/UX** - button appearance and behavior unchanged
- ✅ **Existing admin contact buttons** on `/escorts` page already correct

---

## 🔒 Change 2: Restrict Photo Gallery Access to Paid Subscribers

### Problem
Photo gallery access was tied to both subscription status AND `profile.canShowContact`, which was incorrect. Photos should only require an active subscription.

### Solution
Separated photo access logic from contact access logic - photos now only check subscription status.

### Files Modified

#### **`app/profiles/[id]/_components/ProfileDetailView.tsx`**

**Before**:
```typescript
const canShowContact = hasActiveSubscription && profile.canShowContact;

<PremiumProfileCard
  isLocked={!canShowContact}
  upgradeHref={upgradeHref}
  variant="centered"
  className="w-full"
>
  <ImageCarousel
    images={profile.images}
    altPrefix={profile.displayName}
    autoPlayInterval={3000}
    priority
    className="h-full rounded-3xl"
    allowFullQuality={canShowContact}
    displayName={profile.displayName}
  />
</PremiumProfileCard>
```

**After**:
```typescript
const canShowContact = hasActiveSubscription && profile.canShowContact;

<PremiumProfileCard
  isLocked={!hasActiveSubscription}
  upgradeHref={upgradeHref}
  variant="centered"
  className="w-full"
>
  <ImageCarousel
    images={profile.images}
    altPrefix={profile.displayName}
    autoPlayInterval={3000}
    priority
    className="h-full rounded-3xl"
    allowFullQuality={hasActiveSubscription}
    displayName={profile.displayName}
  />
</PremiumProfileCard>
```

**Changes**:
- ✅ Changed `isLocked={!canShowContact}` → `isLocked={!hasActiveSubscription}`
- ✅ Changed `allowFullQuality={canShowContact}` → `allowFullQuality={hasActiveSubscription}`
- ✅ Kept `canShowContact` for contact button and bio/description visibility

### Access Control Logic

| User Type | Photo Access | Contact Button | Bio/Description |
|-----------|-------------|----------------|-----------------|
| **Free/Non-subscribed** | ❌ Blurred | ❌ Disabled | ❌ Hidden |
| **Paid Subscriber (VIP/Platinum)** | ✅ Full Quality | ✅ Enabled* | ✅ Visible* |

*Contact button and bio/description still require `profile.canShowContact` to be true

### Components Used

- **`PremiumProfileCard`** - Blurs content when `isLocked={true}`
- **`ImageCarousel`** - Shows watermarked images when `allowFullQuality={false}`
- **`BlurGate`** - Used on `/escorts/[id]` page (already correct)

---

## 📁 Files Modified Summary

1. ✅ `app/profiles/[id]/_components/ContactButton.tsx` - Redirect to admin contact
2. ✅ `app/profiles/[id]/_components/ProfileDetailView.tsx` - Fixed photo access + removed contact props

---

## ✅ Result

**Status**: ✅ **ALL CHANGES IMPLEMENTED SUCCESSFULLY!**

### Change 1: Admin Contact Redirect ✅
- All model profile contact buttons redirect to `@abeni_agent`
- No individual model contact information exposed
- Consistent contact flow throughout the application

### Change 2: Photo Access Control ✅
- Free users see blurred photos with upgrade overlay
- Paid subscribers see full-quality photos without blur
- Access control properly enforced via subscription check

Both changes maintain existing UI/UX patterns and don't break any functionality! 🎉

