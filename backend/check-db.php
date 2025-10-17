<?php
/**
 * Database Connection Checker
 * Verifies database connectivity and displays status
 */

require_once 'config/config.php';
require_once 'config/database.php';

try {
    $db = new Database();
    $pdo = $db->getConnection();
    
    echo "✅ Database connection successful!\n";
    echo "📊 Database Type: " . (DB_TYPE === 'sqlite' ? 'SQLite' : 'MySQL') . "\n";
    
    if (DB_TYPE === 'sqlite') {
        echo "📁 Database File: " . DB_FILE . "\n";
        echo "📏 File Size: " . number_format(filesize(DB_FILE) / 1024, 2) . " KB\n";
    } else {
        echo "🌐 MySQL Host: " . DB_HOST . "\n";
        echo "🗄️ Database Name: " . DB_NAME . "\n";
    }
    
    // Test a simple query
    $stmt = $pdo->query("SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table'");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "📋 Tables Found: " . $result['table_count'] . "\n";
    
    if ($result['table_count'] > 0) {
        echo "✅ Database is properly initialized!\n";
    } else {
        echo "⚠️ Database exists but no tables found. Run install.php to set up tables.\n";
    }
    
} catch (Exception $e) {
    echo "❌ Database connection failed!\n";
    echo "🔍 Error: " . $e->getMessage() . "\n";
    echo "💡 Make sure to run 'php backend/install.php' to set up the database.\n";
    exit(1);
}
?>
