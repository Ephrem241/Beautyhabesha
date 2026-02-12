# 🧪 Testing Guide: Model Contact & Photo Access Control

**Date**: 2026-02-11  
**Purpose**: Verify that contact redirect and photo access control changes work correctly

---

## 📋 Pre-Testing Checklist

### ✅ Code Verification (Completed)

- ✅ **ContactButton** redirects to `@abeni_agent` (admin Telegram)
- ✅ **ProfileDetailView** uses `hasActiveSubscription` for photo access
- ✅ **getViewerHasActiveSubscription** checks subscription status correctly
- ✅ TypeScript compilation: Zero errors

### 🔧 Setup Requirements

1. **Development Server Running**: `npm run dev`
2. **Database Access**: Ensure PostgreSQL/Neon database is accessible
3. **Test Accounts**:
   - **Free User**: Account without active subscription
   - **Paid User**: Account with active VIP or Platinum subscription
   - **Admin User**: Account with admin role (optional)

---

## 🧪 Test Plan

### Test 1: Contact Button Redirect to Admin ✅

**Objective**: Verify all contact buttons redirect to admin Telegram (`@abeni_agent`)

#### Steps:

1. **Navigate to Profile Page**:
   ```
   http://localhost:3000/profiles/[any-profile-id]
   ```

2. **Locate Contact Button**:
   - Scroll to bottom of page
   - Find green "Contact" button (fixed at bottom)

3. **Inspect Button Link**:
   - Right-click "Contact" button → "Inspect Element"
   - Check `href` attribute
   - **Expected**: `https://t.me/abeni_agent`
   - **NOT Expected**: Individual model's Telegram or phone number

4. **Click Contact Button**:
   - Click the "Contact" button
   - **Expected**: Opens Telegram app/web with `@abeni_agent`
   - **NOT Expected**: Opens individual model's contact

5. **Test with Different Profiles**:
   - Repeat steps 1-4 with 3-5 different profile IDs
   - **Expected**: All redirect to `@abeni_agent`

#### ✅ Success Criteria:
- [ ] Contact button href is `https://t.me/abeni_agent`
- [ ] Clicking button opens Telegram with `@abeni_agent`
- [ ] No individual model contact information is exposed
- [ ] Consistent behavior across all profiles

---

### Test 2: Photo Access for Free/Non-Subscribed Users 🔒

**Objective**: Verify free users see blurred photos with upgrade overlay

#### Steps:

1. **Logout or Use Free Account**:
   - Logout from any existing account
   - OR login with account that has NO active subscription

2. **Navigate to Profile Page**:
   ```
   http://localhost:3000/profiles/[any-profile-id]
   ```

3. **Check Photo Gallery**:
   - Observe the main image carousel
   - **Expected Visual Effects**:
     - ✅ Photos are blurred (blur filter applied)
     - ✅ Photos have reduced brightness (darker)
     - ✅ Lock icon overlay visible
     - ✅ "Subscribe to view full profile" text visible
     - ✅ "Upgrade Now" button visible

4. **Inspect Blur Effect**:
   - Right-click on image → "Inspect Element"
   - Check for `filter: blur(4px) brightness(0.75)` style
   - Check for `PremiumProfileCard` wrapper with blur

5. **Test Upgrade Button**:
   - Click "Upgrade Now" button
   - **Expected**: Redirects to `/pricing` page

6. **Check Image Quality**:
   - Inspect image `src` attribute
   - **Expected**: May contain watermark parameter
   - **NOT Expected**: Full quality unwatermarked images

#### ✅ Success Criteria:
- [ ] Photos are visibly blurred
- [ ] Lock overlay is displayed
- [ ] "Subscribe to view full profile" message shown
- [ ] "Upgrade Now" button redirects to `/pricing`
- [ ] Images may have watermark
- [ ] Cannot view full-quality photos

---

### Test 3: Photo Access for Paid Subscribers 🔓

**Objective**: Verify paid subscribers see full-quality photos without blur

#### Steps:

1. **Login with Paid Account**:
   - Login with account that has active VIP or Platinum subscription
   - Verify subscription status in database:
     ```sql
     SELECT * FROM "Subscription" 
     WHERE "userId" = '[your-user-id]' 
     AND status = 'active';
     ```

2. **Navigate to Profile Page**:
   ```
   http://localhost:3000/profiles/[any-profile-id]
   ```

3. **Check Photo Gallery**:
   - Observe the main image carousel
   - **Expected Visual Effects**:
     - ✅ Photos are clear and sharp (NO blur)
     - ✅ Photos have normal brightness
     - ✅ NO lock icon overlay
     - ✅ NO "Subscribe to view full profile" text
     - ✅ NO "Upgrade Now" button

4. **Inspect Image**:
   - Right-click on image → "Inspect Element"
   - Check that NO blur filter is applied
   - Check that NO `PremiumProfileCard` blur wrapper exists

5. **Test Image Carousel**:
   - Click navigation dots or wait for auto-play
   - **Expected**: Smooth transitions between images
   - **Expected**: All images load in full quality

6. **Check Image Quality**:
   - Inspect image `src` attribute
   - **Expected**: Full quality images without watermark
   - **NOT Expected**: Watermark parameters in URL

#### ✅ Success Criteria:
- [ ] Photos are clear and sharp (no blur)
- [ ] No lock overlay displayed
- [ ] No "Subscribe to view full profile" message
- [ ] No "Upgrade Now" button
- [ ] Images are full quality without watermark
- [ ] Image carousel works smoothly

---

## 🔍 Additional Verification

### Check Database Subscription Status

```sql
-- Check user's active subscription
SELECT 
  u.id,
  u.email,
  u.subscriptionStatus,
  u.currentPlan,
  s.status,
  s.startDate,
  s.endDate
FROM "User" u
LEFT JOIN "Subscription" s ON s.userId = u.id AND s.status = 'active'
WHERE u.email = '[your-test-email]';
```

### Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any errors related to:
   - Image loading failures
   - Component rendering errors
   - Subscription check errors

### Check Network Tab

1. Open browser DevTools (F12)
2. Go to Network tab
3. Filter by "Img" or "XHR"
4. Verify:
   - Images are loading correctly
   - No 404 errors for images
   - Correct image URLs (with/without watermark)

---

## 📊 Test Results Template

```markdown
## Test Results - [Date]

### Test 1: Contact Button Redirect
- Profile ID tested: ___________
- Contact button href: ___________
- Opens Telegram: [ ] Yes [ ] No
- Redirects to @abeni_agent: [ ] Yes [ ] No
- Status: [ ] PASS [ ] FAIL

### Test 2: Free User Photo Access
- User email: ___________
- Subscription status: ___________
- Photos blurred: [ ] Yes [ ] No
- Lock overlay visible: [ ] Yes [ ] No
- Upgrade button works: [ ] Yes [ ] No
- Status: [ ] PASS [ ] FAIL

### Test 3: Paid User Photo Access
- User email: ___________
- Subscription status: active
- Subscription plan: ___________
- Photos clear (no blur): [ ] Yes [ ] No
- No lock overlay: [ ] Yes [ ] No
- Full quality images: [ ] Yes [ ] No
- Status: [ ] PASS [ ] FAIL
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Contact Button Still Shows Model Contact
**Solution**: Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue 2: Photos Not Blurred for Free Users
**Solution**: Check `hasActiveSubscription` is `false` in ProfileDetailView props

### Issue 3: Photos Still Blurred for Paid Users
**Solution**: Verify subscription status in database, check grace period

### Issue 4: Images Not Loading
**Solution**: Check Cloudinary configuration and image URLs

---

## ✅ Final Checklist

- [ ] All contact buttons redirect to `@abeni_agent`
- [ ] Free users see blurred photos with upgrade overlay
- [ ] Paid users see full-quality photos without blur
- [ ] No console errors
- [ ] No network errors
- [ ] Database subscription status correct
- [ ] All test scenarios documented

---

**Next Step**: Run `npm run dev` and follow the test plan above!

