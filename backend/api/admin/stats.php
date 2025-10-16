<?php
/**
 * Admin Stats API Endpoint
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../classes/Auth.php';

function authenticateAdmin() {
    $headers = getallheaders();
    $token = null;
    if (isset($headers['Authorization']) && preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
        $token = $matches[1];
    }
    if (!$token) return ['success' => false, 'error' => 'Authentication required'];
    
    $auth = new Auth();
    $result = $auth->verifyToken($token);
    if (!$result['success']) return $result;
    
    if (!in_array($result['data']['user']['role'], ['admin', 'editor'])) {
        return ['success' => false, 'error' => 'Admin access required'];
    }
    
    return ['success' => true, 'user' => $result['data']['user']];
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    $authResult = authenticateAdmin();
    if (!$authResult['success']) {
        http_response_code(401);
        echo json_encode($authResult);
        exit;
    }
    
    // Get dashboard statistics
    $stats = [];
    
    // Total users
    $stmt = $db->query("SELECT COUNT(*) FROM users");
    $stats['total_users'] = (int)$stmt->fetchColumn();
    
    // Total blogs
    $stmt = $db->query("SELECT COUNT(*) FROM blogs WHERE status = 'published'");
    $stats['total_blogs'] = (int)$stmt->fetchColumn();
    
    // Total portfolio items
    $stmt = $db->query("SELECT COUNT(*) FROM portfolio WHERE status = 'active'");
    $stats['total_portfolio'] = (int)$stmt->fetchColumn();
    
    // Total services
    $stmt = $db->query("SELECT COUNT(*) FROM services WHERE status = 'active'");
    $stats['total_services'] = (int)$stmt->fetchColumn();
    
    // Total testimonials
    $stmt = $db->query("SELECT COUNT(*) FROM testimonials WHERE status = 'approved'");
    $stats['total_testimonials'] = (int)$stmt->fetchColumn();
    
    // Total contacts
    $stmt = $db->query("SELECT COUNT(*) FROM contacts");
    $stats['total_contacts'] = (int)$stmt->fetchColumn();
    
    // New contacts this month
    $stmt = $db->query("SELECT COUNT(*) FROM contacts WHERE created_at >= datetime('now', '-30 days')");
    $stats['new_contacts_month'] = (int)$stmt->fetchColumn();
    
    // Newsletter subscribers
    $stmt = $db->query("SELECT COUNT(*) FROM newsletter_subscribers WHERE status = 'active'");
    $stats['newsletter_subscribers'] = (int)$stmt->fetchColumn();
    
    // Popular blogs (top 5 by views)
    $stmt = $db->query("
        SELECT id, title, views, published_at 
        FROM blogs 
        WHERE status = 'published' 
        ORDER BY views DESC 
        LIMIT 5
    ");
    $stats['popular_blogs'] = $stmt->fetchAll();
    
    // Recent activity (last 10 items)
    $stmt = $db->query("
        SELECT al.*, u.name as user_name
        FROM activity_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 10
    ");
    $stats['recent_activity'] = $stmt->fetchAll();
    
    // Monthly stats for charts
    $stmt = $db->query("
        SELECT 
            strftime('%Y-%m', created_at) as month,
            COUNT(*) as count
        FROM contacts 
        WHERE created_at >= datetime('now', '-12 months')
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month ASC
    ");
    $stats['monthly_contacts'] = $stmt->fetchAll();
    
    $stmt = $db->query("
        SELECT 
            strftime('%Y-%m', created_at) as month,
            COUNT(*) as count
        FROM users 
        WHERE created_at >= datetime('now', '-12 months')
        GROUP BY strftime('%Y-%m', created_at)
        ORDER BY month ASC
    ");
    $stats['monthly_users'] = $stmt->fetchAll();
    
    // System info
    $stats['system_info'] = [
        'php_version' => PHP_VERSION,
        'server_time' => date('c'),
        'database_size' => 0, // Could calculate if needed
        'uptime' => 0 // Could get server uptime if needed
    ];
    
    echo json_encode([
        'success' => true,
        'data' => $stats
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error',
        'message' => $_ENV['APP_ENV'] === 'development' ? $e->getMessage() : 'Something went wrong'
    ]);
}