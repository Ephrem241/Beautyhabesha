# ✅ Spotlight Carousel - Blur & Contact Buttons Fix

**Date**: 2026-02-11  
**Status**: COMPLETE  
**Issues**: Spotlight carousel on home page had no blur effect and missing admin contact buttons

---

## 🐛 **Problems Identified**

### **Issue 1: No Blur Effect on Images** ❌

**Problem**:
- Spotlight carousel images were showing clear/unblurred for all users (free and paid)
- No subscription-based access control
- Inconsistent with `/escorts` page which has `BlurGate` wrapper

**Root Cause**:
- `SpotlightCarousel.tsx` used regular `<Image>` component (line 113-122)
- No `viewerHasAccess` prop passed to component
- No `BlurGate` or `ProtectedEscortImage` component used

---

### **Issue 2: Missing Admin Contact Buttons** ❌

**Problem**:
- Spotlight carousel cards had no Telegram/WhatsApp contact buttons
- `/escorts` page has admin contact buttons for each model card
- Inconsistent user experience between home page and escorts page

**Root Cause**:
- Contact buttons were never implemented in `SpotlightCarousel.tsx`
- Missing helper functions (`buildTelegramUrl`, `buildWhatsAppUrl`)
- Missing icon components (`TelegramIcon`, `WhatsAppIcon`)

---

## ✅ **Solutions Implemented**

### **Fix 1: Added Blur Effect with Access Control**

#### **Changes to `app/_components/SpotlightCarousel.tsx`**

**1. Added Imports**:
```typescript
import { BlurGate } from "./BlurGate";
import { ProtectedEscortImage } from "./ProtectedEscortImage";
import { DEFAULT_ESCORT_TELEGRAM, DEFAULT_ESCORT_WHATSAPP } from "@/lib/escort-defaults";
```

**2. Updated Component Props**:
```typescript
type SpotlightCarouselProps = {
  profiles: SpotlightProfile[];
  viewerHasAccess: boolean;  // NEW: Subscription status
  intervalMs?: number;
};
```

**3. Wrapped Images in BlurGate**:
```typescript
<BlurGate
  isAllowed={viewerHasAccess}
  className="relative flex-1"
  upgradeHref="/pricing"
>
  <div className="relative w-full aspect-[4/5]">
    <ProtectedEscortImage
      src={profile.images[0]}
      alt={profile.displayName}
      fill
      allowFullQuality={viewerHasAccess}
      displayName={profile.displayName}
      escortId={profile.id}
      showWarningOverlay
    />
  </div>
</BlurGate>
```

**Benefits**:
- ✅ Free users see blurred images with "Upgrade Now" overlay
- ✅ Paid subscribers see clear, full-quality images
- ✅ Consistent with `/escorts` page behavior
- ✅ Encourages upgrades to paid plans

---

### **Fix 2: Added Admin Contact Buttons**

#### **Changes to `app/_components/SpotlightCarousel.tsx`**

**1. Added Helper Functions**:
```typescript
function buildTelegramUrl(username: string): string {
  const s = username.replace(/^@/, "").trim();
  if (!s) return "";
  return /^https?:\/\//i.test(s) ? s : `https://t.me/${encodeURIComponent(s)}`;
}

function buildWhatsAppUrl(num: string): string {
  const digits = num.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "";
}
```

**2. Added Icon Components**:
```typescript
function TelegramIcon({ className }: { className?: string }) { ... }
function WhatsAppIcon({ className }: { className?: string }) { ... }
```

**3. Added Contact Buttons to Each Card**:
```typescript
<div className="mt-2 flex items-center justify-center gap-2 pt-2 border-t border-zinc-800/50">
  <span className="text-xs text-zinc-500">Contact admin:</span>
  <div className="flex gap-2">
    {/* Telegram Button */}
    <a href={buildTelegramUrl(DEFAULT_ESCORT_TELEGRAM)} ...>
      <TelegramIcon className="h-5 w-5" />
    </a>
    {/* WhatsApp Button */}
    <a href={buildWhatsAppUrl(DEFAULT_ESCORT_WHATSAPP)} ...>
      <WhatsAppIcon className="h-5 w-5" />
    </a>
  </div>
</div>
```

**Features**:
- ✅ **Telegram Button**: Links to `@abeni_agent`
- ✅ **WhatsApp Button**: Links to `+251912696090`
- ✅ **Branded Colors**: Telegram blue (#0088cc), WhatsApp green (#25D366)
- ✅ **Hover Effects**: Scale animation (110%)
- ✅ **Accessibility**: Proper ARIA labels and focus states
- ✅ **Opens in New Tab**: `target="_blank"` with security attributes

---

### **Fix 3: Updated Home Page**

#### **Changes to `app/page.tsx`**

**Before**:
```typescript
<SpotlightCarousel profiles={spotlight.slice(0, 6)} />
```

**After**:
```typescript
<SpotlightCarousel profiles={spotlight.slice(0, 6)} viewerHasAccess={viewerHasAccess} />
```

**Impact**:
- ✅ Passes subscription status to carousel
- ✅ Enables blur effect for non-subscribers
- ✅ Shows clear images for paid subscribers

---

## 📊 **Comparison: Before vs After**

### **Before Fix**

| Feature | Status |
|---------|--------|
| **Blur Effect** | ❌ None - all images clear |
| **Access Control** | ❌ No subscription check |
| **Contact Buttons** | ❌ Missing |
| **Consistency** | ❌ Different from `/escorts` page |

### **After Fix**

| Feature | Status |
|---------|--------|
| **Blur Effect** | ✅ Applied for non-subscribers |
| **Access Control** | ✅ Based on subscription status |
| **Contact Buttons** | ✅ Telegram & WhatsApp |
| **Consistency** | ✅ Matches `/escorts` page |

---

## 🎨 **UI/UX Improvements**

1. **Platinum Card Styling**: Added emerald border glow to match featured status
2. **Structured Layout**: Reorganized card with header, blurred content, and action footer
3. **Green Ring Avatar**: Added `greenRing` prop to ProfileAvatar for consistency
4. **Featured Badge**: Moved to header section for better visibility

---

## 📁 **Files Modified (2)**

1. ✅ `app/_components/SpotlightCarousel.tsx` - Added blur effect and contact buttons
2. ✅ `app/page.tsx` - Passed `viewerHasAccess` prop to carousel

---

## ✅ **Result**

**Status**: ✅ **SPOTLIGHT CAROUSEL ISSUES FIXED!**

The homepage spotlight carousel now:
- ✅ **Blurs images for non-subscribers** with "Upgrade Now" overlay
- ✅ **Shows clear images for paid subscribers** (VIP/Platinum)
- ✅ **Includes admin contact buttons** (Telegram & WhatsApp)
- ✅ **Consistent with `/escorts` page** design and behavior
- ✅ **Encourages upgrades** through visual access control
- ✅ **Provides easy admin contact** for all models

The spotlight carousel is now fully functional and consistent with the rest of the application! 🎉

