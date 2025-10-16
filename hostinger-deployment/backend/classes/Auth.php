<?php
/**
 * Authentication Class
 * Handles user authentication, JWT tokens, and session management
 */

require_once __DIR__ . '/../config/database.php';

class Auth {
    private $db;
    private $jwtSecret;
    private $jwtExpiry;
    
    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->jwtSecret = JWT_SECRET;
        $this->jwtExpiry = JWT_EXPIRY;
    }
    
    /**
     * Generate JWT token
     */
    private function generateJWT($payload) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode($payload);
        
        $headerEncoded = $this->base64UrlEncode($header);
        $payloadEncoded = $this->base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', $headerEncoded . "." . $payloadEncoded, $this->jwtSecret, true);
        $signatureEncoded = $this->base64UrlEncode($signature);
        
        return $headerEncoded . "." . $payloadEncoded . "." . $signatureEncoded;
    }
    
    /**
     * Verify JWT token
     */
    private function verifyJWT($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }
        
        $header = $this->base64UrlDecode($parts[0]);
        $payload = $this->base64UrlDecode($parts[1]);
        $signature = $this->base64UrlDecode($parts[2]);
        
        $expectedSignature = hash_hmac('sha256', $parts[0] . "." . $parts[1], $this->jwtSecret, true);
        
        if (!hash_equals($expectedSignature, $signature)) {
            return false;
        }
        
        $payloadData = json_decode($payload, true);
        
        if (!$payloadData || $payloadData['exp'] < time()) {
            return false;
        }
        
        return $payloadData;
    }
    
    /**
     * Base64 URL encode
     */
    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL decode
     */
    private function base64UrlDecode($data) {
        return base64_decode(str_pad(strtr($data, '-_', '+/'), strlen($data) % 4, '=', STR_PAD_RIGHT));
    }
    
    /**
     * Register new user
     */
    public function register($email, $password, $name, $role = 'user') {
        try {
            // Check if user already exists
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
            $stmt->execute([$email]);
            
            if ($stmt->rowCount() > 0) {
                return [
                    'success' => false,
                    'error' => 'User already exists with this email'
                ];
            }
            
            // Validate password strength
            if (strlen($password) < 6) {
                return [
                    'success' => false,
                    'error' => 'Password must be at least 6 characters long'
                ];
            }
            
            // Hash password
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT, ['cost' => BCRYPT_COST]);
            
            // Generate verification token
            $verificationToken = bin2hex(random_bytes(32));
            
            // Insert user
            $stmt = $this->db->prepare("
                INSERT INTO users (email, password, name, role, verification_token, created_at) 
                VALUES (?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([$email, $hashedPassword, $name, $role, $verificationToken]);
            $userId = $this->db->lastInsertId();
            
            // Create user profile
            $stmt = $this->db->prepare("
                INSERT INTO user_profiles (user_id, preferences, created_at) 
                VALUES (?, ?, NOW())
            ");
            
            $defaultPreferences = json_encode([
                'theme' => 'light',
                'notifications' => true,
                'language' => 'en',
                'timezone' => 'UTC'
            ]);
            
            $stmt->execute([$userId, $defaultPreferences]);
            
            // Log activity
            $this->logActivity($userId, 'user_registered', 'users', $userId, 'User registered successfully');
            
            return [
                'success' => true,
                'message' => 'User registered successfully',
                'data' => [
                    'user_id' => $userId,
                    'verification_token' => $verificationToken
                ]
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'error' => 'Registration failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Login user
     */
    public function login($email, $password, $rememberMe = false) {
        try {
            // Get user data - simplified for missing user_profiles table
            $stmt = $this->db->prepare("
                SELECT u.*
                FROM users u 
                WHERE u.email = ? AND u.status = 'active'
            ");
            
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return [
                    'success' => false,
                    'error' => 'Invalid email or password'
                ];
            }
            
            // Check if account is locked
            if ($user['locked_until'] && $user['locked_until'] > date('Y-m-d H:i:s')) {
                return [
                    'success' => false,
                    'error' => 'Account is temporarily locked. Please try again later.'
                ];
            }
            
            // Verify password
            if (!password_verify($password, $user['password'])) {
                // Increment login attempts
                $this->incrementLoginAttempts($user['id']);
                
                return [
                    'success' => false,
                    'error' => 'Invalid email or password'
                ];
            }
            
            // Reset login attempts
            $this->resetLoginAttempts($user['id']);
            
            // Generate JWT token
            $tokenExpiry = $rememberMe ? time() + (30 * 24 * 60 * 60) : time() + $this->jwtExpiry; // 30 days or default
            
            $payload = [
                'user_id' => $user['id'],
                'email' => $user['email'],
                'role' => $user['role'],
                'iat' => time(),
                'exp' => $tokenExpiry
            ];
            
            $token = $this->generateJWT($payload);
            $tokenHash = hash('sha256', $token);
            
            // Store session - simplified for missing user_sessions table
            // For now, we'll skip session storage and rely on JWT validation
            
            // Update last login
            $stmt = $this->db->prepare("UPDATE users SET last_login = NOW() WHERE id = ?");
            $stmt->execute([$user['id']]);
            
            // Log activity
            $this->logActivity($user['id'], 'user_login', 'users', $user['id'], 'User logged in successfully');
            
            // Prepare user data for response
            unset($user['password'], $user['verification_token'], $user['reset_token']);
            
            return [
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'token' => $token,
                    'expires_at' => date('c', $tokenExpiry),
                    'user' => $user
                ]
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'error' => 'Login failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Verify token and get user data
     */
    public function verifyToken($token) {
        try {
            $payload = $this->verifyJWT($token);
            
            if (!$payload) {
                return [
                    'success' => false,
                    'error' => 'Invalid or expired token'
                ];
            }
            
            // Simplified token verification - just validate JWT and get user
            $userId = $payload['user_id'];
            $stmt = $this->db->prepare("
                SELECT u.*
                FROM users u 
                WHERE u.id = ? AND u.status = 'active'
            ");
            
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return [
                    'success' => false,
                    'error' => 'User not found or inactive'
                ];
            }
            
            // Prepare user data
            $userData = [
                'id' => $user['id'],
                'email' => $user['email'],
                'name' => $user['name'],
                'role' => $user['role'],
                'avatar' => $user['avatar'],
                'preferences' => [],
                'timezone' => 'UTC',
                'language' => 'en'
            ];
            
            return [
                'success' => true,
                'data' => [
                    'user' => $userData,
                    'session' => [
                        'expires_at' => date('c', $payload['exp']),
                        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? null
                    ]
                ]
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Token verification failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Logout user
     */
    public function logout($token) {
        try {
            $tokenHash = hash('sha256', $token);
            
            // Deactivate session
            $stmt = $this->db->prepare("UPDATE user_sessions SET is_active = 0 WHERE token_hash = ?");
            $stmt->execute([$tokenHash]);
            
            // Get user ID for logging
            $payload = $this->verifyJWT($token);
            if ($payload) {
                $this->logActivity($payload['user_id'], 'user_logout', 'users', $payload['user_id'], 'User logged out');
            }
            
            return [
                'success' => true,
                'message' => 'Logged out successfully'
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => 'Logout failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Change password
     */
    public function changePassword($userId, $currentPassword, $newPassword) {
        try {
            // Get current password hash
            $stmt = $this->db->prepare("SELECT password FROM users WHERE id = ?");
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return [
                    'success' => false,
                    'error' => 'User not found'
                ];
            }
            
            // Verify current password
            if (!password_verify($currentPassword, $user['password'])) {
                return [
                    'success' => false,
                    'error' => 'Current password is incorrect'
                ];
            }
            
            // Validate new password
            if (strlen($newPassword) < 6) {
                return [
                    'success' => false,
                    'error' => 'New password must be at least 6 characters long'
                ];
            }
            
            // Hash new password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT, ['cost' => BCRYPT_COST]);
            
            // Update password
            $stmt = $this->db->prepare("UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?");
            $stmt->execute([$hashedPassword, $userId]);
            
            // Invalidate all sessions except current one
            $stmt = $this->db->prepare("UPDATE user_sessions SET is_active = 0 WHERE user_id = ?");
            $stmt->execute([$userId]);
            
            // Log activity
            $this->logActivity($userId, 'password_changed', 'users', $userId, 'Password changed successfully');
            
            return [
                'success' => true,
                'message' => 'Password changed successfully'
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'error' => 'Password change failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Request password reset
     */
    public function requestPasswordReset($email) {
        try {
            // Check if user exists
            $stmt = $this->db->prepare("SELECT id, name FROM users WHERE email = ? AND status = 'active'");
            $stmt->execute([$email]);
            $user = $stmt->fetch();
            
            if (!$user) {
                // Don't reveal if email exists or not
                return [
                    'success' => true,
                    'message' => 'If the email exists, a reset link has been sent'
                ];
            }
            
            // Generate reset token
            $resetToken = bin2hex(random_bytes(32));
            $resetExpires = date('Y-m-d H:i:s', time() + 3600); // 1 hour
            
            // Update user with reset token
            $stmt = $this->db->prepare("
                UPDATE users 
                SET reset_token = ?, reset_expires = ?, updated_at = NOW() 
                WHERE id = ?
            ");
            
            $stmt->execute([$resetToken, $resetExpires, $user['id']]);
            
            // Log activity
            $this->logActivity($user['id'], 'password_reset_requested', 'users', $user['id'], 'Password reset requested');
            
            // TODO: Send email with reset link
            // For now, return the token for testing
            return [
                'success' => true,
                'message' => 'If the email exists, a reset link has been sent',
                'data' => [
                    'reset_token' => $resetToken // Remove this in production
                ]
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'error' => 'Password reset request failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Reset password with token
     */
    public function resetPassword($token, $newPassword) {
        try {
            // Find user with valid reset token
            $stmt = $this->db->prepare("
                SELECT id FROM users 
                WHERE reset_token = ? AND reset_expires > NOW() AND status = 'active'
            ");
            
            $stmt->execute([$token]);
            $user = $stmt->fetch();
            
            if (!$user) {
                return [
                    'success' => false,
                    'error' => 'Invalid or expired reset token'
                ];
            }
            
            // Validate new password
            if (strlen($newPassword) < 6) {
                return [
                    'success' => false,
                    'error' => 'Password must be at least 6 characters long'
                ];
            }
            
            // Hash new password
            $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT, ['cost' => BCRYPT_COST]);
            
            // Update password and clear reset token
            $stmt = $this->db->prepare("
                UPDATE users 
                SET password = ?, reset_token = NULL, reset_expires = NULL, updated_at = NOW() 
                WHERE id = ?
            ");
            
            $stmt->execute([$hashedPassword, $user['id']]);
            
            // Invalidate all sessions
            $stmt = $this->db->prepare("UPDATE user_sessions SET is_active = 0 WHERE user_id = ?");
            $stmt->execute([$user['id']]);
            
            // Log activity
            $this->logActivity($user['id'], 'password_reset', 'users', $user['id'], 'Password reset successfully');
            
            return [
                'success' => true,
                'message' => 'Password reset successfully'
            ];
            
        } catch (PDOException $e) {
            return [
                'success' => false,
                'error' => 'Password reset failed: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Increment login attempts
     */
    private function incrementLoginAttempts($userId) {
        $stmt = $this->db->prepare("
            UPDATE users 
            SET login_attempts = login_attempts + 1,
                locked_until = CASE 
                    WHEN login_attempts >= 4 THEN DATE_ADD(NOW(), INTERVAL 30 MINUTE)
                    ELSE locked_until 
                END
            WHERE id = ?
        ");
        
        $stmt->execute([$userId]);
    }
    
    /**
     * Reset login attempts
     */
    private function resetLoginAttempts($userId) {
        $stmt = $this->db->prepare("
            UPDATE users 
            SET login_attempts = 0, locked_until = NULL 
            WHERE id = ?
        ");
        
        $stmt->execute([$userId]);
    }
    
    /**
     * Log activity
     */
    private function logActivity($userId, $action, $entity, $entityId, $description, $changes = null) {
        try {
            $stmt = $this->db->prepare("
                INSERT INTO activity_logs (user_id, action, entity, entity_id, description, changes, ip_address, user_agent, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
            ");
            
            $stmt->execute([
                $userId,
                $action,
                $entity,
                $entityId,
                $description,
                $changes ? json_encode($changes) : null,
                $_SERVER['REMOTE_ADDR'] ?? null,
                $_SERVER['HTTP_USER_AGENT'] ?? null
            ]);
            
        } catch (PDOException $e) {
            // Log error but don't fail the main operation
            error_log("Failed to log activity: " . $e->getMessage());
        }
    }
    
    /**
     * Check if user has permission
     */
    public function hasPermission($userId, $permission) {
        $stmt = $this->db->prepare("SELECT role FROM users WHERE id = ? AND status = 'active'");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return false;
        }
        
        // Define role permissions
        $permissions = [
            'admin' => ['*'], // Admin has all permissions
            'editor' => ['read', 'write', 'edit', 'publish'],
            'user' => ['read']
        ];
        
        $userPermissions = $permissions[$user['role']] ?? [];
        
        return in_array('*', $userPermissions) || in_array($permission, $userPermissions);
    }
    
    /**
     * Get user by ID
     */
    public function getUserById($userId) {
        try {
            $stmt = $this->db->prepare("
                SELECT u.*, up.* 
                FROM users u 
                LEFT JOIN user_profiles up ON u.id = up.user_id 
                WHERE u.id = ?
            ");
            
            $stmt->execute([$userId]);
            $user = $stmt->fetch();
            
            if ($user) {
                unset($user['password'], $user['verification_token'], $user['reset_token']);
                $user['preferences'] = json_decode($user['preferences'] ?? '{}', true);
                $user['social_links'] = json_decode($user['social_links'] ?? '{}', true);
            }
            
            return $user;
            
        } catch (PDOException $e) {
            return null;
        }
    }
    
    /**
     * Validate token and return user data (alias for verifyToken)
     */
    public function validateToken($token = null) {
        if (!$token) {
            $headers = getallheaders();
            if (isset($headers['Authorization'])) {
                $authHeader = $headers['Authorization'];
                if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                    $token = $matches[1];
                }
            }
        }
        
        if (!$token) {
            return null;
        }
        
        $result = $this->verifyToken($token);
        return $result['success'] ? $result['data']['user'] : null;
    }
    
    /**
     * Get current authenticated user
     */
    public function getCurrentUser() {
        return $this->validateToken();
    }
}