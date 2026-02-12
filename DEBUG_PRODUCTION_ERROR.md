# 🔍 Debugging Production Server Component Error

**Error**: `An error occurred in the Server Components render. The specific message is omitted in production builds.`

---

## 🚀 **Quick Debug Steps**

### **Step 1: Check Vercel Runtime Logs**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Click on the failing deployment
4. Click **"Runtime Logs"** tab
5. Look for the actual error message (it will be visible there)

---

### **Step 2: Run Production Build Locally**

```bash
# Build the production version
npm run build

# Start production server
npm start

# Open http://localhost:3000 and check terminal for errors
```

The terminal will show the **actual error message** that's hidden in production.

---

### **Step 3: Check Browser Console for Digest**

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for the error with a `digest` property
4. Copy the digest value (e.g., `"1234567890"`)
5. Search for this digest in Vercel Runtime Logs

---

## 🔍 **Common Causes**

### **1. Database Connection Error**

**Symptom**: Error on pages that fetch data from database

**Cause**: `DATABASE_URL` not set or invalid in Vercel

**Fix**:
```bash
# Verify DATABASE_URL is set in Vercel
# Settings → Environment Variables → DATABASE_URL
```

---

### **2. Prisma Client Not Generated**

**Symptom**: `@prisma/client` import errors

**Cause**: `prisma generate` failed during build

**Fix**: Check build logs for Prisma errors

---

### **3. Missing Environment Variables**

**Symptom**: Errors related to `process.env.VARIABLE_NAME`

**Cause**: Environment variable not set in Vercel

**Fix**: Add all required env vars from `.env` to Vercel

---

### **4. Server Action Errors**

**Symptom**: Error when submitting forms or calling server actions

**Cause**: Uncaught error in server action

**Fix**: Add try-catch blocks to all server actions

---

### **5. Authentication Errors**

**Symptom**: Error on protected pages

**Cause**: NextAuth configuration issue

**Fix**: Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set correctly

---

## 🛠️ **Debugging Commands**

### **Test Production Build Locally**

```bash
# Clean build
npm run clean-build

# Build production
npm run build

# Start production server
npm start
```

### **Check Prisma Connection**

```bash
# Test database connection
npx prisma db pull

# Regenerate Prisma Client
npx prisma generate
```

### **Check TypeScript Errors**

```bash
# Type check
npm run type-check
```

---

## 📋 **Environment Variables Checklist**

Verify these are set in Vercel:

- ✅ `DATABASE_URL` (with "Expose to Build Step" checked)
- ✅ `DIRECT_URL` (with "Expose to Build Step" checked)
- ✅ `NEXTAUTH_SECRET`
- ✅ `NEXTAUTH_URL` (should be your production domain)
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `CLOUDINARY_CLOUD_NAME`
- ✅ `CLOUDINARY_API_KEY`
- ✅ `CLOUDINARY_API_SECRET`
- ✅ `CRON_SECRET`

---

## 🎯 **Most Likely Causes (Based on Recent Changes)**

### **1. Prisma Connection Issue**

Since we just changed Prisma configuration, the most likely cause is:

**Issue**: Runtime Prisma Client can't connect to database

**Check**: Look for this in Vercel Runtime Logs:
```
PrismaClientInitializationError: Can't reach database server
```

**Fix**: Verify `DATABASE_URL` is correctly set in Vercel environment variables

---

### **2. Missing NEXTAUTH_URL**

**Issue**: `NEXTAUTH_URL` might still be set to `http://localhost:3000`

**Fix**: Update in Vercel to your production domain:
```
NEXTAUTH_URL=https://your-domain.vercel.app
```

---

## 📝 **Next Steps**

1. ✅ Check Vercel Runtime Logs for actual error
2. ✅ Run production build locally to see error
3. ✅ Verify all environment variables are set
4. ✅ Check that `DATABASE_URL` is valid and accessible

---

## 💡 **Pro Tip**

To see detailed errors in production, you can temporarily add error logging:

```typescript
// In your root layout or error boundary
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ErrorBoundary
          fallback={(error) => {
            console.error('Server Component Error:', error);
            return <div>Error: {error.message}</div>;
          }}
        >
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

But **remove this before going to production** as it can leak sensitive information!

