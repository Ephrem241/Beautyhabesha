# Prerender Error Fix: AgeGate Component

## 🐛 Problem

Production build was failing during static page generation with prerender errors:

```
Error: Route "/dashboard/bookings/[bookingId]/pay": Uncached data was accessed outside of <Suspense>.
Error: Route "/18-plus": Uncached data was accessed outside of <Suspense>.

Location: app/_components/AgeGate.tsx:11
Component: AgeGate
Issue: usePathname() hook called during prerendering
```

**Additional Issues**:
1. Configuration warning: `experimental.cacheComponents` moved to stable API
2. Build failing on multiple routes during static generation

---

## 🔍 Root Cause

### Issue 1: usePathname() During Prerendering

The `AgeGate` component uses `usePathname()` hook to check if the current route is in the `LEGAL_PATHS` array. During prerendering (SSR/SSG), this hook accesses uncached data, which delays the entire page from rendering.

**Original Code**:
```typescript
export function AgeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // ← Causes prerender error
  const [accepted, setAcceptedState] = useState<boolean | null>(null);
  
  const isLegalPath = LEGAL_PATHS.some((p) => pathname?.startsWith(p));
  // ...
}
```

### Issue 2: Experimental API Moved to Stable

Next.js 16 moved `experimental.cacheComponents` to the stable `cacheComponents` API.

---

## ✅ Solutions Applied

### Solution 1: Wrap AgeGate in Suspense Boundary ⭐

**File**: `app/_components/AgeGate.tsx`

**Changes**:
1. Created `AgeGateLoading` component for fallback UI
2. Split logic into `AgeGateInner` component (uses `usePathname()`)
3. Wrapped `AgeGateInner` in `<Suspense>` boundary

**New Code**:
```typescript
import { Suspense } from "react";

// Loading fallback
function AgeGateLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
    </div>
  );
}

// Inner component that uses usePathname()
function AgeGateInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // ← Now safe inside Suspense
  const [accepted, setAcceptedState] = useState<boolean | null>(null);
  
  useEffect(() => {
    queueMicrotask(() => setAcceptedState(getAgeGateAccepted()));
  }, []);

  const isLegalPath = LEGAL_PATHS.some((p) => pathname?.startsWith(p));
  if (isLegalPath) {
    return <>{children}</>;
  }
  
  // ... rest of logic
}

// Wrapper with Suspense boundary
export function AgeGate({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<AgeGateLoading />}>
      <AgeGateInner>{children}</AgeGateInner>
    </Suspense>
  );
}
```

**Why This Works**:
- ✅ Suspense boundary tells Next.js to handle async data access gracefully
- ✅ Fallback UI shows while `usePathname()` resolves during prerendering
- ✅ Doesn't block the entire page from rendering
- ✅ Maintains all existing functionality

### Solution 2: Update Configuration to Stable API

**File**: `next.config.ts`

**Change**:
```diff
  const nextConfig: NextConfig = {
-   experimental: {
-     cacheComponents: true,
-   },
+   cacheComponents: true,
  };
```

**Why**: Cache Components is now stable in Next.js 16, no longer experimental.

---

## 🧪 Testing

### Step 1: Clean Build

```bash
npm run clean-build
```

Expected output:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (all routes)
✓ Finalizing page optimization
```

### Step 2: Verify No Prerender Errors

Check that these routes build successfully:
- ✅ `/dashboard/bookings/[bookingId]/pay`
- ✅ `/18-plus`
- ✅ All other routes

### Step 3: Test Age Gate Functionality

```bash
npm run start
```

Visit http://localhost:3000 and verify:
1. ✅ Age gate appears on first visit
2. ✅ Legal paths (`/terms`, `/privacy`, `/consent`, `/18-plus`) bypass age gate
3. ✅ Accepting age gate stores preference in localStorage
4. ✅ Age gate doesn't appear on subsequent visits
5. ✅ Loading spinner shows briefly during initial render

---

## 📊 Impact

### Before Fix
- ❌ Build fails during static page generation
- ❌ Prerender errors on 2+ routes
- ❌ Configuration warning about experimental API

### After Fix
- ✅ Build completes successfully
- ✅ All routes prerender without errors
- ✅ No configuration warnings
- ✅ Age gate functionality preserved
- ✅ Better user experience (loading state during SSR)

---

## 🔑 Key Concepts

### Suspense Boundaries

Suspense boundaries allow React to handle async operations during rendering:
- Shows fallback UI while waiting for data
- Prevents blocking the entire page
- Required for client components using hooks like `usePathname()` during SSR/SSG

### usePathname() and Prerendering

`usePathname()` accesses router state, which is async during prerendering:
- During SSR/SSG, pathname isn't immediately available
- Without Suspense, this blocks the entire page
- With Suspense, Next.js can stream the page and fill in the content when ready

---

## 📚 Related Documentation

- **TypeScript Build Fix**: `docs/TYPESCRIPT_BUILD_FIX.md`
- **Cache Components Migration**: `docs/CACHE_COMPONENTS_MIGRATION.md`
- **Quick Reference**: `docs/BUILD_ERROR_QUICK_FIX.md`

---

## ✅ Summary

**Problem**: Prerender errors due to `usePathname()` in AgeGate component  
**Cause**: Uncached data access during SSR/SSG without Suspense boundary  
**Solution**: Wrap component in Suspense with loading fallback  
**Impact**: Build succeeds, functionality preserved, better UX  
**Status**: ✅ Fixed  

---

**Fixed**: 2026-02-07  
**Next.js**: 16.1.2  
**Pattern**: Suspense boundary for client components in layouts  

