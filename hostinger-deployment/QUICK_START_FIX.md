# 🚀 Quick Start: Admin Panel Fix

## Problem
Admin panel shows: `Login failed: SQLSTATE[HY000]: General error: 1 no such table: user_profiles`

## ✅ Quick Fix (2 Minutes)

### Step 1: Run Migration Script

**Via Browser (Easiest):**
```
https://your-domain.com/backend/migrate_user_profiles.php
```

**Via SSH:**
```bash
cd public_html/backend
php migrate_user_profiles.php
```

### Step 2: Login to Admin Panel

```
URL: https://your-domain.com/admin
Email: admin@adilgfx.com (or admin@adilcreator.com)
Password: admin123
```

### Step 3: Change Default Password!
⚠️ **IMPORTANT:** Change the default password immediately after first login.

---

## What This Fix Does

✅ Creates the missing `user_profiles` table
✅ Adds profiles for all existing users
✅ Sets default preferences (theme, language, timezone)
✅ Enables admin panel to work correctly

---

## If Migration Script Doesn't Work

### Alternative: Reinstall Database

1. **Backup your data first!**
2. Run: `https://your-domain.com/backend/install.php?action=2`
3. This will drop all tables and recreate them

---

## Files Updated in This Deployment

✅ Database schemas with user_profiles table
✅ Auth.php - user authentication 
✅ Admin users API endpoint
✅ Migration script
✅ Fix documentation

---

## Need More Help?

See detailed guides:
- `FIX_ADMIN_PANEL.md` - Comprehensive fix guide
- `DEPLOYMENT_GUIDE_ROCKET_SITE.md` - Full deployment instructions
- `ADMIN_PANEL_FIX_SUMMARY.md` - Technical details

---

## Verification Checklist

After running the fix:

- [ ] Migration script completed successfully
- [ ] Can access admin panel at /admin
- [ ] Can login with admin credentials
- [ ] Can see user list without errors
- [ ] Changed default admin password
- [ ] Admin panel fully functional

---

**Status: Ready to Deploy** ✅

All files in `hostinger-deployment/` folder are ready to upload to Hostinger.
