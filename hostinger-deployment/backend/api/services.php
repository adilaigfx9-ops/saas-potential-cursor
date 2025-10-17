<?php
/**
 * Services API Endpoint
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../classes/Auth.php';

$method = $_SERVER['REQUEST_METHOD'];
$pathParts = explode('/', trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/'));
$serviceId = (count($pathParts) >= 3 && is_numeric(end($pathParts))) ? (int)end($pathParts) : null;
$slug = (count($pathParts) >= 3 && !is_numeric(end($pathParts))) ? end($pathParts) : null;

function authenticateUser() {
    $headers = getallheaders();
    $token = null;
    if (isset($headers['Authorization']) && preg_match('/Bearer\s+(.*)$/i', $headers['Authorization'], $matches)) {
        $token = $matches[1];
    }
    if (!$token) return ['success' => false, 'error' => 'Authentication required'];
    
    $auth = new Auth();
    $result = $auth->verifyToken($token);
    return $result['success'] ? ['success' => true, 'user' => $result['data']['user']] : $result;
}

try {
    $database = new Database();
    $db = $database->getConnection();
    
    switch ($method) {
        case 'GET':
            if ($serviceId || $slug) {
                $field = $serviceId ? 'id' : 'slug';
                $value = $serviceId ?: $slug;
                
                $stmt = $db->prepare("
                    SELECT s.*, c.name as category_name, GROUP_CONCAT(t.name) as tags
                    FROM services s
                    LEFT JOIN categories c ON s.category_id = c.id
                    LEFT JOIN service_tags st ON s.id = st.service_id
                    LEFT JOIN tags t ON st.tag_id = t.id
                    WHERE s.$field = ? AND s.status = 'active'
                    GROUP BY s.id
                ");
                $stmt->execute([$value]);
                $service = $stmt->fetch();
                
                if (!$service) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Service not found']);
                    break;
                }
                
                $service['features'] = json_decode($service['features'] ?? '[]', true);
                $service['pricing_tiers'] = json_decode($service['pricing_tiers'] ?? '[]', true);
                $service['gallery_images'] = json_decode($service['gallery_images'] ?? '[]', true);
                $service['tags'] = $service['tags'] ? explode(',', $service['tags']) : [];
                
                echo json_encode(['success' => true, 'data' => $service]);
            } else {
                $page = (int)($_GET['page'] ?? 1);
                $limit = min((int)($_GET['limit'] ?? 10), 50);
                $category = $_GET['category'] ?? null;
                $popular = $_GET['popular'] ?? null;
                $offset = ($page - 1) * $limit;
                
                $whereConditions = ["s.status = 'active'"];
                $params = [];
                
                if ($category) {
                    $whereConditions[] = "c.slug = ?";
                    $params[] = $category;
                }
                if ($popular === '1') {
                    $whereConditions[] = "s.popular = 1";
                }
                
                $whereClause = 'WHERE ' . implode(' AND ', $whereConditions);
                
                $countQuery = "SELECT COUNT(*) FROM services s LEFT JOIN categories c ON s.category_id = c.id $whereClause";
                $stmt = $db->prepare($countQuery);
                $stmt->execute($params);
                $total = $stmt->fetchColumn();
                
                $query = "
                    SELECT s.*, c.name as category_name
                    FROM services s
                    LEFT JOIN categories c ON s.category_id = c.id
                    $whereClause
                    ORDER BY s.popular DESC, s.sort_order ASC
                    LIMIT ? OFFSET ?
                ";
                $params[] = $limit;
                $params[] = $offset;
                
                $stmt = $db->prepare($query);
                $stmt->execute($params);
                $services = $stmt->fetchAll();
                
                foreach ($services as &$service) {
                    $service['features'] = json_decode($service['features'] ?? '[]', true);
                    $service['pricing_tiers'] = json_decode($service['pricing_tiers'] ?? '[]', true);
                    $service['title'] = $service['name']; // Add title field for compatibility
                    $service['subtitle'] = $service['tagline']; // Add subtitle field for compatibility
                    $service['packages'] = $service['pricing_tiers']; // Add packages field for compatibility
                }
                
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'services' => $services,
                        'pagination' => [
                            'total' => (int)$total,
                            'page' => (int)$page,
                            'limit' => (int)$limit,
                            'pages' => ceil($total / $limit)
                        ]
                    ]
                ]);
            }
            break;
            
        case 'POST':
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            if (!in_array($authResult['user']['role'], ['admin', 'editor'])) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Permission denied']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['name']) || !isset($input['description'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Name and description are required']);
                break;
            }
            
            $slug = isset($input['slug']) ? trim($input['slug']) : strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $input['name'])));
            
            // Ensure unique slug
            $originalSlug = $slug;
            $counter = 1;
            while (true) {
                $stmt = $db->prepare("SELECT id FROM services WHERE slug = ?");
                $stmt->execute([$slug]);
                if (!$stmt->fetch()) break;
                $slug = $originalSlug . '-' . $counter++;
            }
            
            $stmt = $db->prepare("
                INSERT INTO services (
                    name, slug, tagline, description, long_description, icon,
                    featured_image, gallery_images, features, pricing_tiers,
                    delivery_time, category_id, popular, featured, status,
                    sort_order, min_price, max_price, meta_title, meta_description, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                trim($input['name']),
                $slug,
                trim($input['tagline'] ?? ''),
                trim($input['description']),
                trim($input['long_description'] ?? ''),
                trim($input['icon'] ?? ''),
                trim($input['featured_image'] ?? ''),
                json_encode($input['gallery_images'] ?? []),
                json_encode($input['features'] ?? []),
                json_encode($input['pricing_tiers'] ?? []),
                trim($input['delivery_time'] ?? ''),
                $input['category_id'] ?? null,
                $input['popular'] ?? 0,
                $input['featured'] ?? 0,
                $input['status'] ?? 'active',
                $input['sort_order'] ?? 0,
                $input['min_price'] ?? null,
                $input['max_price'] ?? null,
                trim($input['meta_title'] ?? ''),
                trim($input['meta_description'] ?? '')
            ]);
            
            echo json_encode(['success' => true, 'message' => 'Service created successfully', 'data' => ['id' => $db->lastInsertId(), 'slug' => $slug]]);
            break;
            
        case 'PUT':
            if (!$serviceId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Service ID is required']);
                break;
            }
            
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            if (!in_array($authResult['user']['role'], ['admin', 'editor'])) {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Permission denied']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            
            $updates = [];
            $params = [];
            
            $allowedFields = ['name', 'slug', 'tagline', 'description', 'long_description', 'icon', 'featured_image', 'delivery_time', 'category_id', 'popular', 'featured', 'status', 'sort_order', 'min_price', 'max_price', 'meta_title', 'meta_description'];
            
            foreach ($allowedFields as $field) {
                if (isset($input[$field])) {
                    $updates[] = "$field = ?";
                    $params[] = $input[$field];
                }
            }
            
            if (isset($input['features'])) {
                $updates[] = "features = ?";
                $params[] = json_encode($input['features']);
            }
            if (isset($input['pricing_tiers'])) {
                $updates[] = "pricing_tiers = ?";
                $params[] = json_encode($input['pricing_tiers']);
            }
            if (isset($input['gallery_images'])) {
                $updates[] = "gallery_images = ?";
                $params[] = json_encode($input['gallery_images']);
            }
            
            if (empty($updates)) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'No updates provided']);
                break;
            }
            
            $updates[] = "updated_at = NOW()";
            $params[] = $serviceId;
            
            $query = "UPDATE services SET " . implode(', ', $updates) . " WHERE id = ?";
            $stmt = $db->prepare($query);
            $stmt->execute($params);
            
            echo json_encode(['success' => true, 'message' => 'Service updated successfully']);
            break;
            
        case 'DELETE':
            if (!$serviceId) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Service ID is required']);
                break;
            }
            
            $authResult = authenticateUser();
            if (!$authResult['success']) {
                http_response_code(401);
                echo json_encode($authResult);
                break;
            }
            
            if ($authResult['user']['role'] !== 'admin') {
                http_response_code(403);
                echo json_encode(['success' => false, 'error' => 'Permission denied']);
                break;
            }
            
            $stmt = $db->prepare("DELETE FROM service_tags WHERE service_id = ?");
            $stmt->execute([$serviceId]);
            
            $stmt = $db->prepare("DELETE FROM services WHERE id = ?");
            $stmt->execute([$serviceId]);
            
            echo json_encode(['success' => true, 'message' => 'Service deleted successfully']);
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Method not allowed']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Internal server error', 'message' => $_ENV['APP_ENV'] === 'development' ? $e->getMessage() : 'Something went wrong']);
}