# 🔍 Admin Login Diagnostic & Fix Guide

**Date**: 2026-02-12  
**Issue**: Cannot log in as admin user  
**Related**: Prisma 7.x migration and environment variable configuration

---

## 🎯 **Quick Diagnosis Checklist**

Run through these checks in order:

### **1. Database Connectivity** ✅

**Issue**: The diagnostic script timeout suggests database connection issues.

**Check**:
```bash
# Test database connection
npx tsx scripts/diagnose-admin-login.ts
```

**If it hangs**: DATABASE_URL is not set or invalid

**Fix**: Ensure `.env` file exists with valid DATABASE_URL:
```env
DATABASE_URL='postgresql://neondb_owner:npg_Rq85WHiTKNdV@ep-young-voice-ahm0fgug-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require'
```

---

### **2. Admin User Exists** ❓

**Check if admin users exist**:
```sql
-- Run this in your Neon database console
SELECT id, username, email, role, "bannedAt", "createdAt" 
FROM users 
WHERE role = 'admin';
```

**If no results**: No admin user exists

**Fix**: Create admin user (see solutions below)

---

### **3. User Account Issues** ⚠️

**Common issues preventing admin login**:

| Issue | Symptom | Fix |
|-------|---------|-----|
| **No password** | OAuth user trying credentials login | Create new account with password |
| **Banned account** | `bannedAt` is not null | Unban user in database |
| **Wrong role** | `role = "user"` instead of `"admin"` | Update role to "admin" |
| **Wrong username** | User not found error | Check spelling, use email instead |

---

### **4. Environment Variables** 🔐

**Required for authentication**:

```env
NEXTAUTH_SECRET=WbLPOYLcO/OO42gzYtPCV8U8HqgPCVjxTwT9FAprFDk=
NEXTAUTH_URL=http://localhost:3000  # Local
NEXTAUTH_URL=https://your-domain.vercel.app  # Production
DATABASE_URL=postgresql://...
```

**Check**: Verify `.env` file exists and contains these variables

---

## ✅ **Solutions**

### **Solution 1: Assign Admin Role to Existing User** (RECOMMENDED)

If you already have a user account:

```bash
# Using email
npx tsx scripts/assign-first-admin.ts your-email@example.com

# Or using username (if script supports it)
npx tsx scripts/assign-admin.ts your-email@example.com
```

**What this does**:
- Finds user by email
- Updates `role` field to `"admin"`
- Allows login with admin privileges

---

### **Solution 2: Create New Admin User via SQL**

If no suitable user exists, create one directly in the database:

```sql
-- 1. Create user with hashed password
-- Password: "admin123" (CHANGE THIS!)
-- Hash generated with: bcrypt.hash("admin123", 10)
INSERT INTO users (id, username, email, password, role, "createdAt", "updatedAt")
VALUES (
  'admin_' || gen_random_uuid()::text,
  'admin',
  'admin@example.com',
  '$2b$10$rBV2kHYgLVxLfxEqYhQxPeF.5vN8FqY7qXqZ1kZqYqYqYqYqYqYqY',  -- REPLACE WITH REAL HASH
  'admin',
  NOW(),
  NOW()
);
```

**⚠️ IMPORTANT**: Generate a real bcrypt hash:

```bash
# Generate password hash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_PASSWORD', 10).then(console.log);"
```

---

### **Solution 3: Update Existing User to Admin**

If you know the user ID or email:

```sql
-- Update by email
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Update by username
UPDATE users 
SET role = 'admin' 
WHERE username = 'your-username';

-- Verify
SELECT id, username, email, role FROM users WHERE role = 'admin';
```

---

### **Solution 4: Unban Admin User**

If admin user is banned:

```sql
-- Unban user
UPDATE users 
SET "bannedAt" = NULL 
WHERE email = 'admin@example.com';

-- Verify
SELECT id, username, email, role, "bannedAt" FROM users WHERE email = 'admin@example.com';
```

---

## 🔧 **Authentication Flow Analysis**

### **Login Process** (lib/auth.ts)

1. **User submits credentials** → `/auth/login`
2. **CredentialsProvider.authorize()** (lines 50-97):
   - ✅ Validates username/password not empty
   - ✅ Finds user by username (case-insensitive)
   - ✅ Checks user has password (not OAuth user)
   - ✅ Compares password with bcrypt
   - ✅ Checks user not banned
   - ✅ Returns user object with role
3. **JWT callback** (lines 101-130):
   - ✅ Fetches user from database
   - ✅ Checks ban status again
   - ✅ Sets `token.role` and `token.uid`
4. **Session callback** (lines 131-137):
   - ✅ Sets `session.user.role` from token
5. **Middleware** (proxy.ts lines 52-58):
   - ✅ Checks `token.role === "admin"` for admin routes
   - ✅ Redirects non-admins to homepage

---

## 🐛 **Common Login Errors**

### **Error: "User not found"**

**Cause**: Username doesn't exist or wrong spelling

**Fix**:
- Check username spelling (case-insensitive)
- Try using email instead of username
- List all users to find correct username

---

### **Error: "Invalid password"**

**Cause**: Wrong password or password hash corrupted

**Fix**:
- Reset password via forgot password flow
- Or update password hash in database:
  ```sql
  UPDATE users 
  SET password = '$2b$10$NEW_HASH_HERE' 
  WHERE email = 'admin@example.com';
  ```

---

### **Error: "Banned user attempted login"**

**Cause**: User account is banned (`bannedAt` is not null)

**Fix**: Unban user (see Solution 4 above)

---

### **Error: "Access Denied" after login**

**Cause**: User logged in but role is not "admin"

**Fix**: Update role to admin (see Solution 3 above)

---

## 📋 **Step-by-Step Fix Process**

### **If you can access the database**:

1. ✅ Connect to Neon database console
2. ✅ Run: `SELECT * FROM users WHERE role = 'admin';`
3. ✅ If no results → Create admin user (Solution 2 or 3)
4. ✅ If user exists → Check `bannedAt`, `password` fields
5. ✅ Fix any issues found
6. ✅ Try logging in again

### **If you cannot access the database**:

1. ✅ Ensure `.env` file exists with DATABASE_URL
2. ✅ Run: `npx tsx scripts/diagnose-admin-login.ts`
3. ✅ Follow the diagnostic output
4. ✅ Use `assign-first-admin.ts` script to create admin

---

## 🎯 **Recommended Action Plan**

**For local development**:

```bash
# 1. Ensure database connection works
npx prisma db pull

# 2. Run diagnostic
npx tsx scripts/diagnose-admin-login.ts

# 3. If no admin exists, create one
# First, register a new account at http://localhost:3000/auth/register
# Then assign admin role:
npx tsx scripts/assign-first-admin.ts your-email@example.com

# 4. Try logging in
# Go to http://localhost:3000/auth/login
```

**For production (Vercel)**:

1. ✅ Access Neon database console directly
2. ✅ Run SQL queries to check/create admin user
3. ✅ Or use Vercel CLI to run scripts on production database

---

## 📝 **Files Involved**

| File | Purpose | Key Lines |
|------|---------|-----------|
| `lib/auth.ts` | Authentication logic | Lines 50-97 (authorize), 101-137 (callbacks) |
| `proxy.ts` | Route protection | Lines 52-58 (admin check) |
| `scripts/assign-first-admin.ts` | Create first admin | Full file |
| `scripts/diagnose-admin-login.ts` | Diagnostic tool | Full file |
| `prisma/schema.prisma` | User model | Lines 59-94 (User model) |

---

## ✅ **Verification**

After applying fixes, verify:

1. ✅ Admin user exists: `SELECT * FROM users WHERE role = 'admin';`
2. ✅ User has password: `password` field is not null
3. ✅ User not banned: `bannedAt` field is null
4. ✅ Can log in: Visit `/auth/login` and enter credentials
5. ✅ Can access admin: Visit `/dashboard/admin/users`

---

**Next Steps**: Run the diagnostic script and let me know the output!

