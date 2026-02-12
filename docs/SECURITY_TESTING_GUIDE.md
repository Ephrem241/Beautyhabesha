# Security Testing Guide - Ban Enforcement

**Purpose**: Test the security fixes for ban enforcement before deploying to Vercel  
**Date**: 2026-02-10  
**Estimated Time**: 15-20 minutes

---

## 🎯 What We're Testing

1. **Middleware ban check** - Banned users are blocked on every request
2. **JWT callback ban check** - Banned users' tokens are invalidated on refresh
3. **Admin access to escort routes** - Admins can access escort pages
4. **Performance** - No significant latency added to requests

---

## 🛠️ Prerequisites

1. **Local development environment running**:
   ```bash
   npm run dev
   ```

2. **Database access** (to manually ban/unban users)

3. **Test accounts**:
   - Regular user account
   - Escort account
   - Admin account

---

## 📋 Test Cases

### Test 1: Middleware Ban Check (Real-time Enforcement)

**Objective**: Verify that banned users are immediately blocked from accessing protected routes

**Steps**:

1. **Login as a regular user**:
   - Go to `http://localhost:3000/auth/login`
   - Login with a test user account
   - Navigate to `/dashboard` - should work ✅

2. **Ban the user while logged in**:
   - Open your database client (e.g., Prisma Studio, pgAdmin)
   - Find the user in the `User` table
   - Set `bannedAt` to the current timestamp:
     ```sql
     UPDATE "User" SET "bannedAt" = NOW() WHERE id = 'user-id-here';
     ```

3. **Try to access a protected route**:
   - Refresh the page or navigate to `/dashboard`
   - **Expected**: Redirected to `/auth/login?banned=1`
   - **Expected**: Console shows: `[Security] Banned user attempted access: <user-id>`

4. **Verify ban message**:
   - Check if the login page shows a ban message (if implemented)
   - URL should have `?banned=1` parameter

5. **Unban the user**:
   ```sql
   UPDATE "User" SET "bannedAt" = NULL WHERE id = 'user-id-here';
   ```

6. **Login again**:
   - Should be able to login and access `/dashboard` ✅

**✅ Pass Criteria**:
- Banned user is immediately redirected to login
- Console shows security warning
- Unbanned user can login normally

---

### Test 2: JWT Callback Ban Check (Token Invalidation)

**Objective**: Verify that banned users' tokens are invalidated on refresh

**Steps**:

1. **Login as a user**:
   - Login and access `/dashboard`

2. **Ban the user**:
   ```sql
   UPDATE "User" SET "bannedAt" = NOW() WHERE id = 'user-id-here';
   ```

3. **Force token refresh**:
   - Wait 24 hours (not practical), OR
   - Manually trigger by clearing the session cookie and logging in again, OR
   - Modify `updateAge` in `lib/auth.ts` to 10 seconds for testing:
     ```typescript
     updateAge: 10, // 10 seconds for testing
     ```
   - Wait 10 seconds and refresh the page

4. **Expected behavior**:
   - After token refresh, user should be logged out
   - Console shows: `[Auth] Banned user token refresh blocked: <user-id>`

5. **Restore `updateAge`**:
   ```typescript
   updateAge: 24 * 60 * 60, // 24 hours
   ```

**✅ Pass Criteria**:
- Token is invalidated after refresh
- User is logged out
- Console shows auth warning

---

### Test 3: Admin Access to Escort Routes

**Objective**: Verify that admins can access escort routes for moderation

**Steps**:

1. **Login as an admin**:
   - Go to `http://localhost:3000/auth/login`
   - Login with an admin account

2. **Access escort routes**:
   - Navigate to `/escort/profile` (or any escort route)
   - **Expected**: Access granted ✅
   - **Not expected**: Redirected to home page ❌

3. **Access admin routes**:
   - Navigate to `/admin` or `/dashboard/admin`
   - **Expected**: Access granted ✅

4. **Login as a regular user**:
   - Logout and login as a regular user (not escort, not admin)

5. **Try to access escort routes**:
   - Navigate to `/escort/profile`
   - **Expected**: Redirected to home page ✅

**✅ Pass Criteria**:
- Admins can access escort routes
- Regular users cannot access escort routes
- Escorts can access escort routes

---

### Test 4: Performance Check

**Objective**: Verify that the ban check doesn't add significant latency

**Steps**:

1. **Open browser DevTools** (F12)
   - Go to Network tab

2. **Login and navigate to protected routes**:
   - Navigate to `/dashboard`, `/escort/profile`, etc.

3. **Check response times**:
   - Look at the "Time" column in Network tab
   - Middleware should add < 50ms latency

4. **Check server logs**:
   - No error messages about database queries
   - No timeout warnings

**✅ Pass Criteria**:
- Page load times are acceptable (< 500ms for middleware)
- No database errors in console
- No timeout warnings

---

## 🧪 Quick Test Script

For faster testing, you can use this SQL script to create a test user and test ban enforcement:

```sql
-- Create a test user (if not exists)
INSERT INTO "User" (id, username, email, password, role, "createdAt", "updatedAt")
VALUES (
  'test-ban-user-123',
  'testbanuser',
  'testban@example.com',
  '$2b$10$abcdefghijklmnopqrstuvwxyz', -- Replace with actual bcrypt hash
  'user',
  NOW(),
  NOW()
);

-- Ban the user
UPDATE "User" SET "bannedAt" = NOW() WHERE id = 'test-ban-user-123';

-- Unban the user
UPDATE "User" SET "bannedAt" = NULL WHERE id = 'test-ban-user-123';

-- Check ban status
SELECT id, username, "bannedAt" FROM "User" WHERE id = 'test-ban-user-123';
```

---

## 🐛 Troubleshooting

### Issue: "Cannot find module '@/lib/db'"

**Solution**: Make sure Prisma client is generated:
```bash
npx prisma generate
```

### Issue: Middleware not running

**Solution**: Check that `proxy.ts` is in the root directory and the matcher config is correct.

### Issue: Database query fails in middleware

**Solution**: 
1. Check that `DATABASE_URL` is set correctly in `.env`
2. Ensure Neon connection pooling is enabled
3. Check Prisma client is generated

### Issue: User not redirected after ban

**Solution**:
1. Check browser console for errors
2. Verify `bannedAt` is set in database
3. Clear browser cache and cookies
4. Check middleware logs

---

## ✅ Test Completion Checklist

- [ ] Test 1: Middleware ban check works
- [ ] Test 2: JWT callback ban check works
- [ ] Test 3: Admin can access escort routes
- [ ] Test 4: Performance is acceptable
- [ ] No errors in browser console
- [ ] No errors in server logs
- [ ] All test users unbanned (cleanup)

---

## 🚀 After Testing

Once all tests pass:

1. **Commit the changes**:
   ```bash
   git add proxy.ts lib/auth.ts docs/
   git commit -m "fix: implement critical security fixes for ban enforcement"
   ```

2. **Deploy to Vercel**:
   - Push to your Git repository
   - Vercel will automatically deploy
   - Or use `vercel deploy` command

3. **Verify in production**:
   - Test ban enforcement on production
   - Check Vercel logs for any errors
   - Monitor performance metrics

---

## 📞 Support

If you encounter any issues during testing:

1. Check the error messages in browser console and server logs
2. Review `docs/SECURITY_FIXES_SUMMARY.md` for implementation details
3. Review `docs/SECURITY_AUDIT_REPORT.md` for context

---

**Status**: Ready for testing ✅

