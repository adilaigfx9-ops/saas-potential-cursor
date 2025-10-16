<?php
/**
 * Database Migration: Add user_profiles table
 * Run this script on Hostinger to fix the admin panel login error
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

header('Content-Type: text/plain; charset=utf-8');

echo "🔧 Database Migration: Adding user_profiles table\n";
echo "================================================\n\n";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
    echo "📊 Database driver: $driver\n\n";
    
    // Check if user_profiles table already exists
    echo "🔍 Checking if user_profiles table exists...\n";
    
    if ($driver === 'sqlite') {
        $stmt = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name='user_profiles'");
        $exists = $stmt->fetch() !== false;
    } else {
        $stmt = $db->query("SHOW TABLES LIKE 'user_profiles'");
        $exists = $stmt->fetch() !== false;
    }
    
    if ($exists) {
        echo "✅ user_profiles table already exists!\n";
        echo "No migration needed.\n\n";
        exit(0);
    }
    
    // Create user_profiles table
    echo "📝 Creating user_profiles table...\n";
    
    if ($driver === 'sqlite') {
        $sql = "CREATE TABLE IF NOT EXISTS user_profiles (
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
        )";
        
        $db->exec($sql);
        $db->exec("CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)");
    } else {
        // MySQL
        $sql = "CREATE TABLE IF NOT EXISTS user_profiles (
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
        
        $db->exec($sql);
        $db->exec("CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id)");
    }
    
    echo "✅ user_profiles table created successfully!\n\n";
    
    // Create profiles for existing users
    echo "👥 Creating profiles for existing users...\n";
    
    $stmt = $db->query("SELECT id FROM users");
    $users = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $defaultPreferences = json_encode([
        'theme' => 'light',
        'notifications' => true,
        'language' => 'en',
        'timezone' => 'UTC'
    ]);
    
    $created = 0;
    foreach ($users as $userId) {
        $checkStmt = $db->prepare("SELECT id FROM user_profiles WHERE user_id = ?");
        $checkStmt->execute([$userId]);
        
        if (!$checkStmt->fetch()) {
            $insertStmt = $db->prepare("
                INSERT INTO user_profiles (user_id, preferences, timezone, language) 
                VALUES (?, ?, 'UTC', 'en')
            ");
            $insertStmt->execute([$userId, $defaultPreferences]);
            $created++;
        }
    }
    
    echo "✅ Created profiles for $created users\n\n";
    
    echo "🎉 Migration completed successfully!\n";
    echo "================================================\n\n";
    echo "ℹ️  Admin panel should now work correctly.\n";
    echo "📧 Admin login: admin@adilgfx.com (or admin@adilcreator.com)\n";
    echo "🔑 Default password: admin123\n\n";
    
} catch (Exception $e) {
    echo "❌ Migration failed: " . $e->getMessage() . "\n";
    echo "\nError Details:\n";
    echo $e->getTraceAsString() . "\n\n";
    
    echo "Please check:\n";
    echo "1. Database connection settings in config.php\n";
    echo "2. Database user has CREATE TABLE permissions\n";
    echo "3. PHP PDO extension is installed\n\n";
    
    exit(1);
}
