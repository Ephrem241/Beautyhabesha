# Prisma Timing Fix: Date.now() Prerender Error

## 🐛 Problem

Production build was failing during static page generation on route `/payment-instructions/[slug]` with a prerender error:

```
Error: Route '/payment-instructions/[slug]' used `Date.now()` before accessing either 
uncached data (e.g. `fetch()`) or Request data (e.g. `cookies()`, `headers()`, 
`connection()`, and `searchParams`)

Location: lib/db.ts:53:26
Component: Prisma middleware extension
Issue: Date.now() called before query execution
```

---

## 🔍 Root Cause

### The Issue

In `lib/db.ts`, the Prisma client extension uses `Date.now()` to track query performance timing:

**Original Code (PROBLEMATIC)**:
```typescript
async $allOperations({ model, operation, args, query }) {
  const start = Date.now(); // ← Called BEFORE query execution
  const result = await query(args);
  const ms = Date.now() - start;
  // ...
}
```

### Why This Causes Prerender Errors

Next.js 16's prerendering system requires that:
1. **System time access** (`Date.now()`) must occur AFTER accessing uncached data
2. During static page generation, calling `Date.now()` before a database query triggers a prerender error
3. This is because Next.js needs to know if the page depends on request-time data

### Affected Routes

- `/payment-instructions/[slug]` - Uses `generateStaticParams()` for static generation
- Any other route that uses Prisma queries during prerendering

---

## ✅ Solution Applied

### Use `performance.now()` Instead of `Date.now()`

**File**: `lib/db.ts`

**Change**: Replaced `Date.now()` with `performance.now()`

**New Code**:
```typescript
async $allOperations({ model, operation, args, query }) {
  const maxAttempts = 3;
  let attempt = 0;
  
  while (true) {
    try {
      // Use performance.now() instead of Date.now() to avoid Next.js prerender issues
      // performance.now() is relative timing and doesn't access system time
      const start = performance.now();
      const result = await query(args);
      const ms = performance.now() - start;
      
      if (ms > SLOW_QUERY_MS) {
        console.warn(`[Prisma slow query] ${model ?? "root"}.${operation} took ${ms.toFixed(2)}ms`);
      }
      return result;
    } catch (err: unknown) {
      // ... retry logic
    }
  }
}
```

---

## 🎯 Why This Works

### `performance.now()` vs `Date.now()`

| Feature | `Date.now()` | `performance.now()` |
|---------|--------------|---------------------|
| **Returns** | Absolute timestamp (ms since epoch) | Relative time (ms since page load) |
| **Precision** | 1ms | Sub-millisecond (microseconds) |
| **System Time** | ✅ Accesses system clock | ❌ Doesn't access system clock |
| **Prerender Safe** | ❌ Triggers Next.js error | ✅ Safe for prerendering |
| **Use Case** | Absolute time, dates | Performance timing, duration |

### Benefits

1. ✅ **Prerender Compatible**: Doesn't trigger Next.js prerender errors
2. ✅ **More Accurate**: Sub-millisecond precision for performance tracking
3. ✅ **Monotonic**: Not affected by system clock changes
4. ✅ **Same Functionality**: Still measures query duration accurately
5. ✅ **Better for Performance**: Designed specifically for timing measurements

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
✓ Generating static pages
  ├ /payment-instructions/[slug] (static)
✓ Finalizing page optimization
```

### Step 2: Verify Static Generation

Check that `/payment-instructions/[slug]` generates successfully:

```bash
npm run build
```

Look for:
```
Route (app)                              Size     First Load JS
├ ○ /payment-instructions/[slug]         1.2 kB         85.3 kB
```

The `○` symbol indicates static generation succeeded.

### Step 3: Test Query Timing

Run the app and check logs for slow query warnings:

```bash
npm run dev
```

Visit a page that uses Prisma queries. If a query takes > 200ms, you should see:
```
[Prisma slow query] User.findUnique took 245.67ms
```

Note: The timing now shows decimal precision (e.g., `245.67ms` instead of `245ms`).

---

## 📊 Impact

### Before Fix
- ❌ Build fails on `/payment-instructions/[slug]`
- ❌ Prerender error: "used `Date.now()` before accessing uncached data"
- ❌ Cannot generate static pages with Prisma queries

### After Fix
- ✅ Build succeeds on all routes
- ✅ Static generation works for `/payment-instructions/[slug]`
- ✅ Query timing still tracked accurately
- ✅ More precise timing measurements (sub-millisecond)
- ✅ No prerender errors

---

## 🔑 Key Concepts

### Next.js 16 Prerendering Rules

Next.js 16 enforces strict rules during prerendering:

1. **System Time Access**: `Date.now()`, `new Date()` must occur AFTER uncached data access
2. **Request Data**: `cookies()`, `headers()`, `searchParams` must be accessed before system time
3. **Uncached Data**: `fetch()`, database queries are considered uncached data

### Why These Rules Exist

- Ensures deterministic static generation
- Prevents accidental dynamic behavior in static pages
- Makes it clear when a page depends on request-time data

### Performance Timing Best Practices

For measuring code execution time:
- ✅ **Use**: `performance.now()` - High precision, prerender-safe
- ❌ **Avoid**: `Date.now()` - Can cause prerender issues
- ✅ **Use**: `console.time()` / `console.timeEnd()` - Also uses `performance.now()` internally

---

## 📚 Related Documentation

- **Prerender Error Fix**: `docs/PRERENDER_ERROR_FIX.md`
- **Build Error Quick Fix**: `docs/BUILD_ERROR_QUICK_FIX.md`
- **Cache Components Migration**: `docs/CACHE_COMPONENTS_MIGRATION.md`

---

## 🔄 Alternative Solutions (Not Used)

### Option 1: Conditional Timing (More Complex)
```typescript
const isBuild = process.env.NODE_ENV === 'production' && !process.env.VERCEL_ENV;
const start = isBuild ? undefined : Date.now();
```
❌ More complex, doesn't solve the root issue

### Option 2: Mark Routes as Dynamic (Loses Static Generation)
```typescript
export const dynamic = 'force-dynamic';
```
❌ Loses static generation benefits, slower page loads

### Option 3: Remove Timing (Loses Functionality)
```typescript
// Just remove the timing code
```
❌ Loses valuable performance monitoring

### Option 4: Use performance.now() ✅ CHOSEN
```typescript
const start = performance.now();
```
✅ Simple, accurate, prerender-safe, better precision

---

## ✅ Summary

**Problem**: `Date.now()` in Prisma middleware causing prerender errors  
**Cause**: System time access before uncached data access  
**Solution**: Replace `Date.now()` with `performance.now()`  
**Impact**: Build succeeds, static generation works, better timing precision  
**Status**: ✅ Fixed  

**Benefits**:
- ✅ Prerender-safe timing
- ✅ Sub-millisecond precision
- ✅ Monotonic (not affected by clock changes)
- ✅ Designed for performance measurements

---

**Fixed**: 2026-02-07  
**Next.js**: 16.1.2  
**Pattern**: Use `performance.now()` for timing in prerendered contexts  

