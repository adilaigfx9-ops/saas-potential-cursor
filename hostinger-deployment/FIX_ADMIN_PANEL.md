# Fix Admin Panel Database Error

## Problem
Admin panel login fails with error:
```
Login failed: SQLSTATE[HY000]: General error: 1 no such table: user_profiles
```

## Solution

The `user_profiles` table is missing from the database. Follow these steps to fix it:

### Option 1: Run Migration Script (Recommended)

1. **Access via Browser:**
   ```
   https://your-domain.com/backend/migrate_user_profiles.php
   ```

2. **Or via SSH/Terminal:**
   ```bash
   cd public_html/backend
   php migrate_user_profiles.php
   ```

The script will:
- Create the `user_profiles` table
- Create profiles for all existing users
- Set up default preferences

### Option 2: Manual Database Fix

If you have phpMyAdmin or database access:

1. **For MySQL/MariaDB:**
   ```sql
   CREATE TABLE IF NOT EXISTS user_profiles (
       id INT AUTO_INCREMENT PRIMARY KEY,
       user_id INT NOT NULL UNIQUE,
       phone VARCHAR(50),
       address TEXT,
       city VARCHAR(100),
       country VARCHAR(100),
       timezone VARCHAR(50) DEFAULT 'UTC',
       language VARCHAR(10) DEFAULT 'en',
       bio TEXT,
       website VARCHAR(500),
       social_links TEXT,
       preferences TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

   CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
   ```

2. **For SQLite:**
   ```sql
   CREATE TABLE IF NOT EXISTS user_profiles (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       user_id INTEGER NOT NULL UNIQUE,
       phone TEXT,
       address TEXT,
       city TEXT,
       country TEXT,
       timezone TEXT DEFAULT 'UTC',
       language TEXT DEFAULT 'en',
       bio TEXT,
       website TEXT,
       social_links TEXT,
       preferences TEXT,
       created_at TEXT DEFAULT CURRENT_TIMESTAMP,
       updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
   );

   CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
   ```

### Option 3: Reinstall Database Schema

If you're starting fresh or can afford to lose existing data:

1. **Via Browser:**
   ```
   https://your-domain.com/backend/install.php?action=2
   ```

2. **Via SSH:**
   ```bash
   cd public_html/backend
   php install.php
   # Choose option 2 when prompted
   ```

## Verify the Fix

After running the migration:

1. Clear browser cache
2. Go to admin login page
3. Login with:
   - **Email:** admin@adilgfx.com (or admin@adilcreator.com)
   - **Password:** admin123

4. Change the default password immediately!

## Files Updated

The following files have been updated to include the `user_profiles` table:

- ✅ `backend/database/complete_schema.sql`
- ✅ `backend/database/hostinger_mysql_schema.sql`
- ✅ `backend/classes/Auth.php`
- ✅ `backend/api/admin/users.php`
- ✅ `backend/fix_database.php`
- ✅ `backend/migrate_user_profiles.php` (new)

## Need Help?

If you still encounter issues:

1. Check PHP error logs in your hosting control panel
2. Verify database credentials in `backend/config/config.php`
3. Ensure database user has CREATE TABLE permissions
4. Contact support with the error message

## Prevention

To prevent this in future deployments:

1. Always run `install.php` or `migrate_user_profiles.php` after deploying
2. Keep database schemas in sync with code
3. Test admin panel access before going live
