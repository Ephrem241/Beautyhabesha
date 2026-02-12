# Image Display Styles Implementation Review

**Date**: 2026-02-10  
**Objective**: Review three image display styles for escort profile images  
**Status**: ⚠️ **INCONSISTENCIES FOUND**

---

## 📋 Executive Summary

The application implements **three distinct image display styles** for escort profiles based on subscription status:

1. **✅ Watermarked Image** - Non-subscribers see images with Cloudinary watermark overlay
2. **✅ Blurred + Watermarked Image** - Non-subscribers see blurred images with watermark + subscription CTA overlay
3. **✅ Full-Quality Image** - Subscribers see high-quality, unblurred, unwatermarked images

### **Critical Finding** ⚠️

**`ImageCarousel` and `ProfileSlider` components do NOT apply watermarks** - they render raw image URLs directly. This means:
- Profile detail pages (`/profiles/[id]`) may show unwatermarked images to non-subscribers
- The blur overlay from `PremiumProfileCard` provides visual gating, but images underneath are NOT watermarked

---

## 🎨 Three Image Display Styles

### **Style 1: Watermarked Image** (Preview Mode)

**Purpose**: Show images to non-subscribers with brand protection  
**Implementation**: `ProtectedEscortImage` with `allowFullQuality={false}`

**How it works**:
```typescript
// lib/image-watermark.ts
const watermarkText = "Beautyhabesha | {displayName}";
const textLayer = `l_text:arial_42_bold:${encoded},co_white,o_50`;
const applyLayer = "fl_layer_apply,g_south_east,x_24,y_24";
// URL: https://res.cloudinary.com/.../l_text:arial_42_bold:Beautyhabesha%20%7C%20Name,co_white,o_50/fl_layer_apply,g_south_east,x_24,y_24/image.jpg
```

**Features**:
- ✅ Cloudinary URL transformation (no duplicate storage)
- ✅ Semi-transparent white text (50% opacity)
- ✅ Bottom-right positioning (24px offset)
- ✅ Anti-save UX (prevents right-click, drag)
- ✅ "Protected" badge overlay

**Used on**:
- ✅ Home page (`app/page.tsx`) - Featured escorts
- ❌ NOT used on profile detail pages (uses `ImageCarousel` instead)

---

### **Style 2: Blurred + Watermarked Image** (Contact-Gated)

**Purpose**: Tease content while encouraging subscription  
**Implementation**: `BlurGate` wrapper + `ProtectedEscortImage` inside

**How it works**:
```typescript
// app/_components/BlurGate.tsx
<div className="[&_img]:blur-sm [&_img]:brightness-75">
  <ProtectedEscortImage allowFullQuality={false} /> {/* Watermarked */}
</div>
<LockOverlay /> {/* "Subscribe to view full profile" CTA */}
```

**Features**:
- ✅ CSS blur filter (`blur-sm`) + brightness reduction (75%)
- ✅ Watermark applied underneath blur
- ✅ Lock icon + "Subscribe to view" overlay
- ✅ "Upgrade Now" CTA button

**Used on**:
- ✅ Escorts listing page (`app/escorts/page.tsx`) - All escort cards
- ✅ Escort detail page (`app/escorts/[id]/page.tsx`) - Image gallery + contact info

---

### **Style 3: Full-Quality Image** (Subscriber Access)

**Purpose**: Reward subscribers with high-quality, unobstructed images  
**Implementation**: `ProtectedEscortImage` with `allowFullQuality={true}`

**How it works**:
```typescript
// app/_components/ProtectedEscortImage.tsx
const finalSrc = allowFullQuality ? src : getEscortImageUrl(src, { addWatermark: true });
// When allowFullQuality=true, returns original Cloudinary URL (no transformation)
```

**Features**:
- ✅ Original high-quality image
- ✅ No watermark overlay
- ✅ No blur effect
- ✅ Still has anti-save UX (prevents right-click, drag)
- ✅ No "Protected" badge

**Used on**:
- ✅ All pages when `viewerHasAccess === true`

---

## 🔍 Component Analysis

### **1. ProtectedEscortImage** ✅ (Watermark-Aware)

**File**: `app/_components/ProtectedEscortImage.tsx` (84 lines)

**Key Props**:
- `allowFullQuality: boolean` - Controls watermark application
- `displayName?: string` - Escort name for watermark text
- `escortId?: string` - Fallback for watermark
- `showWarningOverlay?: boolean` - Shows "Protected" badge

**Logic**:
```typescript
const finalSrc =
  allowFullQuality || !src
    ? src  // Full quality - no watermark
    : getEscortImageUrl(src, {  // Apply watermark
        addWatermark: true,
        displayName,
        escortId,
      });
```

**Anti-Save Features**:
- Prevents right-click context menu
- Prevents drag-and-drop
- CSS: `select-none`, `pointer-events-none`

**Rating**: ✅ **EXCELLENT** - Properly implements watermarking

---

### **2. BlurGate** ✅ (Blur + Overlay)

**File**: `app/_components/BlurGate.tsx` (78 lines)

**Key Props**:
- `isAllowed: boolean` - When `false`, applies blur + overlay
- `upgradeHref?: string` - CTA link (default `/pricing`)

**Blur Implementation**:
```typescript
<div className="[&_img]:blur-sm [&_img]:brightness-75">
  {children}  {/* Contains ProtectedEscortImage */}
</div>
```

**Overlay**:
- Lock icon (SVG)
- "Subscribe to view full profile" text
- "Upgrade Now" button (emerald green)

**Rating**: ✅ **EXCELLENT** - Properly implements blur gating

---

### **3. ImageCarousel** ⚠️ (NOT Watermark-Aware)

**File**: `app/_components/ImageCarousel.tsx` (174 lines)

**Key Props**:
- `images: string[]` - Raw image URLs
- `altPrefix: string` - Alt text prefix
- `autoPlayInterval?: number` - Auto-play timing

**⚠️ CRITICAL ISSUE**:
```typescript
<Image
  src={mainImage}  // ❌ Raw URL - NO watermark applied
  alt={`${altPrefix} - ${activeIndex + 1}`}
  fill
  className="object-cover"
/>
```

**Missing**:
- ❌ No `ProtectedEscortImage` integration
- ❌ No watermark application
- ❌ No `allowFullQuality` prop
- ❌ No anti-save UX

**Rating**: ⚠️ **NEEDS FIX** - Does not apply watermarks

---

### **4. ProfileSlider** ⚠️ (NOT Watermark-Aware)

**File**: `app/_components/ProfileSlider.tsx` (169 lines)

**Same issue as `ImageCarousel`**:
```typescript
<Image
  src={mainImage}  // ❌ Raw URL - NO watermark applied
  alt={`${altPrefix} - ${activeIndex + 1}`}
  fill
  className="object-cover"
/>
```

**Rating**: ⚠️ **NEEDS FIX** - Does not apply watermarks

---

### **5. PremiumProfileCard** ⚠️ (Blur Only, No Watermark)

**File**: `app/_components/PremiumProfileCard.tsx` (41 lines)

**Key Props**:
- `isLocked: boolean` - When `true`, applies blur + `LockOverlay`

**Implementation**:
```typescript
<div className="blur-sm brightness-75">
  {children}  {/* Contains ImageCarousel - NO watermark! */}
</div>
<LockOverlay />
```

**⚠️ ISSUE**: Blurs content but does NOT ensure watermarks are applied to images inside

**Rating**: ⚠️ **PARTIAL** - Provides visual gating but not watermark protection

---

## 📊 Page-by-Page Consistency Analysis

### **Home Page** (`app/page.tsx`) ✅

**Access Control**: `getViewerHasActiveSubscription()`  
**Image Display**: `ProtectedEscortImage` with `allowFullQuality={viewerHasAccess}`

**Implementation**:
```typescript
<ProtectedEscortImage
  src={escort.images[0]}
  allowFullQuality={viewerHasAccess}
  displayName={escort.displayName}
/>
```

**Result**:
- ✅ Non-subscribers: Watermarked images
- ✅ Subscribers: Full-quality images
- ❌ No blur overlay (just watermark for non-subscribers)

**Rating**: ✅ **CONSISTENT** - Properly uses `ProtectedEscortImage`

---

### **Escorts Listing Page** (`app/escorts/page.tsx`) ✅

**Access Control**: `getViewerHasActiveSubscription()`  
**Image Display**: `BlurGate` + `ProtectedEscortImage`

**Implementation**:
```typescript
<BlurGate isAllowed={viewerHasAccess}>
  <ProtectedEscortImage
    src={escort.images[0]}
    allowFullQuality={viewerHasAccess}
    displayName={escort.displayName}
  />
</BlurGate>
```

**Result**:
- ✅ Non-subscribers: Blurred + watermarked images + overlay
- ✅ Subscribers: Full-quality images

**Rating**: ✅ **CONSISTENT** - Properly combines `BlurGate` + `ProtectedEscortImage`

---

### **Escort Detail Page** (`app/escorts/[id]/page.tsx`) ✅

**Access Control**: `getViewerHasActiveSubscription()`  
**Image Display**: `BlurGate` + `ProtectedEscortImage` (multiple images)

**Implementation**:
```typescript
<BlurGate isAllowed={viewerHasAccess}>
  {escort.images.map((image) => (
    <ProtectedEscortImage
      src={image}
      allowFullQuality={viewerHasAccess}
      displayName={escort.displayName}
    />
  ))}
</BlurGate>
```

**Result**:
- ✅ Non-subscribers: Blurred + watermarked gallery + overlay
- ✅ Subscribers: Full-quality gallery

**Rating**: ✅ **CONSISTENT** - Properly combines `BlurGate` + `ProtectedEscortImage`

---

### **Profile Detail Page** (`app/profiles/[id]/page.tsx`) ⚠️

**Access Control**: `getViewerHasActiveSubscription()`  
**Image Display**: `PremiumProfileCard` + `ImageCarousel`

**Implementation**:
```typescript
<PremiumProfileCard isLocked={!canShowContact}>
  <ImageCarousel
    images={profile.images}  // ❌ Raw URLs - NO watermark!
    altPrefix={profile.displayName}
  />
</PremiumProfileCard>
```

**Result**:
- ⚠️ Non-subscribers: Blurred images + overlay, but **NO watermarks**
- ✅ Subscribers: Full-quality images

**Rating**: ⚠️ **INCONSISTENT** - Missing watermark protection

---

## 🚨 Issues & Inconsistencies

### **Issue #1: ImageCarousel Missing Watermark Support** ⚠️

**Severity**: **HIGH**  
**Impact**: Profile detail pages show unwatermarked images to non-subscribers

**Problem**:
- `ImageCarousel` renders raw image URLs
- No integration with `ProtectedEscortImage`
- No watermark applied even when user is not subscribed

**Affected Pages**:
- `/profiles/[id]` - Profile detail view

**Recommendation**: See "Recommendations" section below

---

### **Issue #2: ProfileSlider Missing Watermark Support** ⚠️

**Severity**: **MEDIUM**  
**Impact**: If used anywhere, would show unwatermarked images

**Problem**: Same as `ImageCarousel`

**Current Usage**: Not currently used in main pages (only `ImageCarousel` is used)

**Recommendation**: Fix proactively to prevent future issues

---

### **Issue #3: Inconsistent Blur Application** ℹ️

**Severity**: **LOW**  
**Impact**: User experience varies across pages

**Observation**:
- Home page: Watermark only (no blur)
- Escorts listing: Blur + watermark + overlay
- Escort detail: Blur + watermark + overlay
- Profile detail: Blur + overlay (no watermark)

**Question**: Is this intentional design or should home page also use `BlurGate`?

---

## ✅ Recommendations

### **Priority 1: Fix ImageCarousel Watermark Support** 🔴

**Option A: Modify ImageCarousel to accept watermark props**

Create a new prop to control watermarking:

```typescript
type ImageCarouselProps = {
  images: string[];
  altPrefix: string;
  // NEW PROPS:
  allowFullQuality?: boolean;
  displayName?: string;
  escortId?: string;
};

export function ImageCarousel({ images, altPrefix, allowFullQuality = true, displayName, escortId }: ImageCarouselProps) {
  const processedImages = images.map(img =>
    allowFullQuality ? img : getEscortImageUrl(img, { addWatermark: true, displayName, escortId })
  );
  
  // Use processedImages instead of raw images
}
```

**Option B: Wrap ImageCarousel images with ProtectedEscortImage**

Replace `<Image>` inside `ImageCarousel` with `<ProtectedEscortImage>`:

```typescript
// Inside ImageCarousel
<ProtectedEscortImage
  src={mainImage}
  allowFullQuality={allowFullQuality}
  displayName={displayName}
  escortId={escortId}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
/>
```

**Recommended**: **Option A** (cleaner separation of concerns)

---

### **Priority 2: Fix ProfileSlider** 🟡

Apply the same fix as `ImageCarousel` (Option A or B above)

---

### **Priority 3: Standardize Blur Usage** 🟢

**Decision needed**: Should home page also use `BlurGate` for consistency?

**Current**: Home page shows watermarked images without blur  
**Alternative**: Wrap home page images in `BlurGate` like other pages

**Recommendation**: Keep current approach (watermark-only on home for better preview)

---

## 📈 Summary Table

| Component | Watermark Support | Blur Support | Anti-Save UX | Status |
|-----------|-------------------|--------------|--------------|--------|
| `ProtectedEscortImage` | ✅ Yes | ❌ No | ✅ Yes | ✅ **EXCELLENT** |
| `BlurGate` | ➖ N/A (wrapper) | ✅ Yes | ❌ No | ✅ **EXCELLENT** |
| `ImageCarousel` | ❌ **NO** | ❌ No | ⚠️ Partial | ⚠️ **NEEDS FIX** |
| `ProfileSlider` | ❌ **NO** | ❌ No | ⚠️ Partial | ⚠️ **NEEDS FIX** |
| `PremiumProfileCard` | ➖ N/A (wrapper) | ✅ Yes | ❌ No | ✅ **GOOD** |

| Page | Watermark | Blur | Overlay | Status |
|------|-----------|------|---------|--------|
| Home (`/`) | ✅ Yes | ❌ No | ❌ No | ✅ **CONSISTENT** |
| Escorts Listing (`/escorts`) | ✅ Yes | ✅ Yes | ✅ Yes | ✅ **CONSISTENT** |
| Escort Detail (`/escorts/[id]`) | ✅ Yes | ✅ Yes | ✅ Yes | ✅ **CONSISTENT** |
| Profile Detail (`/profiles/[id]`) | ❌ **NO** | ✅ Yes | ✅ Yes | ⚠️ **INCONSISTENT** |

---

## 🎯 Conclusion

### **Are the three styles properly differentiated?**

**YES** - The three styles are clearly defined:
1. Watermarked (preview)
2. Blurred + watermarked (contact-gated)
3. Full-quality (subscriber)

### **Are they working as intended?**

**PARTIALLY** - Most pages work correctly, but:
- ⚠️ Profile detail pages (`/profiles/[id]`) do NOT apply watermarks
- ⚠️ `ImageCarousel` and `ProfileSlider` components lack watermark support

### **Next Steps**

1. ✅ **Fix `ImageCarousel`** - Add watermark support (Priority 1)
2. ✅ **Fix `ProfileSlider`** - Add watermark support (Priority 2)
3. ✅ **Test all pages** - Verify watermarks appear for non-subscribers
4. ℹ️ **Consider standardizing** - Decide if home page should also use blur

---

**Status**: ⚠️ **ACTION REQUIRED** - Fix carousel components to apply watermarks


