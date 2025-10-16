<?php
/**
 * Database Fix Script
 * Adds missing tables required for authentication
 */

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    
    echo "🔧 Fixing database schema...\n";
    
    // Create user_profiles table
    $driver = $db->getAttribute(PDO::ATTR_DRIVER_NAME);
    
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
    } else {
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
        )";
    }
    
    $db->exec($sql);
    echo "✅ Created user_profiles table\n";
    
    // Create user_sessions table
    $sql = "CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token_hash TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )";
    
    $db->exec($sql);
    echo "✅ Created user_sessions table\n";
    
    // Create indexes
    $db->exec("CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash)");
    $db->exec("CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active)");
    echo "✅ Created indexes\n";
    
    // Check if admin user exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ? AND role = 'admin'");
    $stmt->execute(['admin@adilgfx.com']);
    $adminUser = $stmt->fetch();
    
    if (!$adminUser) {
        // Create admin user
        $hashedPassword = password_hash('admin123', PASSWORD_DEFAULT);
        $stmt = $db->prepare("
            INSERT INTO users (email, password, name, role, status, email_verified) 
            VALUES (?, ?, ?, 'admin', 'active', 1)
        ");
        $stmt->execute(['admin@adilgfx.com', $hashedPassword, 'Adil GFX Admin']);
        $adminId = $db->lastInsertId();
        echo "✅ Created admin user\n";
    } else {
        $adminId = $adminUser['id'];
        echo "✅ Admin user already exists\n";
    }
    
    // Create user profile for admin
    $stmt = $db->prepare("SELECT id FROM user_profiles WHERE user_id = ?");
    $stmt->execute([$adminId]);
    if (!$stmt->fetch()) {
        $defaultPreferences = json_encode([
            'theme' => 'light',
            'notifications' => true,
            'language' => 'en',
            'timezone' => 'UTC'
        ]);
        
        $stmt = $db->prepare("
            INSERT INTO user_profiles (user_id, preferences) 
            VALUES (?, ?)
        ");
        $stmt->execute([$adminId, $defaultPreferences]);
        echo "✅ Created admin user profile\n";
    } else {
        echo "✅ Admin user profile already exists\n";
    }
    
    echo "\n🎉 Database fix completed successfully!\n";
    echo "📧 Admin login: admin@adilgfx.com\n";
    echo "🔑 Password: admin123\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>