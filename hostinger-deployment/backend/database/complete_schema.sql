-- =====================================================
-- ADIL CREATOR - COMPLETE DATABASE SCHEMA
-- SQLite Database - Production Ready
-- Includes: Core + Rocket Site Features + AI Integration
-- Version: 1.0.0
-- Date: 2025-10-16
-- =====================================================

PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;
PRAGMA temp_store = MEMORY;

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user', 'admin', 'editor', 'viewer')),
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'banned', 'pending')),
    email_verified INTEGER NOT NULL DEFAULT 0,
    verification_token TEXT,
    reset_token TEXT,
    reset_expires TEXT,
    login_attempts INTEGER DEFAULT 0,
    locked_until TEXT,
    last_login TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- User Profiles Table
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

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT,
    type TEXT NOT NULL DEFAULT 'text' CHECK(type IN ('text', 'number', 'boolean', 'json', 'email', 'url', 'textarea')),
    category TEXT NOT NULL DEFAULT 'general',
    description TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_category ON settings(category);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT,
    icon TEXT,
    parent_id INTEGER,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- Tags Table
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    color TEXT,
    usage_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- =====================================================
-- CONTENT MANAGEMENT TABLES
-- =====================================================

-- Blogs Table
CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    category_id INTEGER,
    author_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
    featured INTEGER NOT NULL DEFAULT 0,
    published INTEGER NOT NULL DEFAULT 0,
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    read_time INTEGER DEFAULT 5,
    published_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category_id);
CREATE INDEX IF NOT EXISTS idx_blogs_author ON blogs(author_id);
CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at);

-- Portfolio Table
CREATE TABLE IF NOT EXISTS portfolio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    long_description TEXT,
    featured_image TEXT NOT NULL,
    gallery_images TEXT,
    category_id INTEGER,
    client_name TEXT,
    project_url TEXT,
    completion_date TEXT,
    technologies TEXT,
    results TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'archived')),
    featured INTEGER NOT NULL DEFAULT 0,
    views INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_portfolio_slug ON portfolio(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_status ON portfolio(status);
CREATE INDEX IF NOT EXISTS idx_portfolio_featured ON portfolio(featured);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON portfolio(category_id);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT,
    description TEXT NOT NULL,
    long_description TEXT,
    icon TEXT,
    featured_image TEXT,
    category_id INTEGER,
    features TEXT,
    pricing_tiers TEXT,
    delivery_time TEXT,
    popular INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_services_slug ON services(slug);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
CREATE INDEX IF NOT EXISTS idx_services_popular ON services(popular);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS testimonials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT,
    company TEXT,
    position TEXT,
    avatar TEXT,
    content TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5 CHECK(rating >= 1 AND rating <= 5),
    service_id INTEGER,
    project_id INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    featured INTEGER NOT NULL DEFAULT 0,
    approved_by INTEGER,
    approved_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (project_id) REFERENCES portfolio(id) ON DELETE SET NULL,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials(status);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured);

-- FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
    `order` INTEGER DEFAULT 0,
    featured INTEGER NOT NULL DEFAULT 0,
    views INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_status ON faqs(status);
CREATE INDEX IF NOT EXISTS idx_faqs_featured ON faqs(featured);

-- =====================================================
-- COMMUNICATION TABLES
-- =====================================================

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    service_interest TEXT,
    budget_range TEXT,
    timeline TEXT,
    source TEXT,
    ip_address TEXT,
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'read', 'replied', 'closed', 'spam')),
    responded_at TEXT,
    responded_by INTEGER,
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (responded_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_created ON contacts(created_at);

-- Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'unsubscribed', 'bounced', 'complained')),
    source TEXT,
    interests TEXT,
    subscribed_at TEXT DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_status ON newsletter_subscribers(status);

-- =====================================================
-- SYSTEM TABLES
-- =====================================================

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id INTEGER,
    description TEXT NOT NULL,
    changes TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    metadata TEXT,
    priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
    is_read INTEGER NOT NULL DEFAULT 0,
    read_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Media Table
CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    file_type TEXT NOT NULL,
    dimensions TEXT,
    alt_text TEXT,
    caption TEXT,
    uploaded_by INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_media_type ON media(file_type);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_created ON media(created_at);

-- =====================================================
-- ROCKET SITE - API MANAGEMENT TABLES
-- =====================================================

-- API Keys Management Table
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    api_key TEXT NOT NULL,
    api_secret TEXT,
    webhook_url TEXT,
    additional_config TEXT,
    status TEXT NOT NULL DEFAULT 'testing' CHECK(status IN ('active', 'inactive', 'testing', 'error')),
    last_tested TEXT,
    test_result TEXT,
    test_response_time_ms INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    last_error_at TEXT,
    monthly_cost REAL DEFAULT 0,
    rate_limit_per_hour INTEGER DEFAULT 100,
    is_enabled INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_api_keys_service ON api_keys(service_name);
CREATE INDEX IF NOT EXISTS idx_api_keys_status ON api_keys(status);
CREATE INDEX IF NOT EXISTS idx_api_keys_enabled ON api_keys(is_enabled);

-- API Usage Logs Table
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    api_key_id INTEGER,
    service_name TEXT NOT NULL,
    endpoint TEXT,
    operation TEXT,
    request_method TEXT,
    request_data TEXT,
    response_data TEXT,
    status_code INTEGER,
    response_time_ms INTEGER,
    success INTEGER NOT NULL DEFAULT 1,
    error_message TEXT,
    tokens_used INTEGER DEFAULT 0,
    cost REAL DEFAULT 0,
    user_id INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_api_usage_service ON api_usage_logs(service_name);
CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_success ON api_usage_logs(success);

-- System Settings Table (Extended)
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT,
    setting_type TEXT NOT NULL DEFAULT 'string' CHECK(setting_type IN ('string', 'number', 'boolean', 'json', 'email', 'url', 'textarea')),
    category TEXT NOT NULL DEFAULT 'general',
    description TEXT,
    is_public INTEGER NOT NULL DEFAULT 0,
    is_encrypted INTEGER NOT NULL DEFAULT 0,
    validation_rules TEXT,
    default_value TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);

-- Feature Toggles Table
CREATE TABLE IF NOT EXISTS feature_toggles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    feature_key TEXT NOT NULL UNIQUE,
    feature_name TEXT NOT NULL,
    is_enabled INTEGER NOT NULL DEFAULT 0,
    config TEXT,
    description TEXT,
    dependencies TEXT,
    requires_api_keys TEXT,
    min_user_role TEXT DEFAULT 'user',
    beta_feature INTEGER NOT NULL DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    last_used_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_feature_toggles_key ON feature_toggles(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_toggles_enabled ON feature_toggles(is_enabled);

-- API Cost Tracking Table
CREATE TABLE IF NOT EXISTS api_cost_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_name TEXT NOT NULL,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    budget_limit REAL DEFAULT 100.00,
    current_spend REAL DEFAULT 0,
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    average_cost_per_request REAL DEFAULT 0,
    estimated_month_end_spend REAL DEFAULT 0,
    last_updated TEXT DEFAULT (datetime('now')),
    UNIQUE(service_name, year, month)
);

CREATE INDEX IF NOT EXISTS idx_api_cost_service ON api_cost_tracking(service_name);
CREATE INDEX IF NOT EXISTS idx_api_cost_period ON api_cost_tracking(year, month);

-- =====================================================
-- ROCKET SITE - AI INTEGRATION TABLES
-- =====================================================

-- AI Usage Log Table
CREATE TABLE IF NOT EXISTS ai_usage_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation TEXT NOT NULL,
    cost REAL NOT NULL DEFAULT 0,
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    user_id INTEGER,
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_operation ON ai_usage_log(operation);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage_log(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_log(user_id);

-- AI Response Cache Table
CREATE TABLE IF NOT EXISTS ai_response_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cache_key TEXT NOT NULL UNIQUE,
    response_data TEXT NOT NULL,
    operation TEXT NOT NULL,
    hit_count INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT NOT NULL,
    last_accessed TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_response_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_response_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_operation ON ai_response_cache(operation);

-- AI Chat Sessions Table
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL UNIQUE,
    user_id INTEGER,
    visitor_id TEXT,
    user_name TEXT,
    user_email TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'ended', 'transferred')),
    total_messages INTEGER NOT NULL DEFAULT 0,
    ai_responses INTEGER NOT NULL DEFAULT 0,
    human_responses INTEGER NOT NULL DEFAULT 0,
    satisfaction_score INTEGER,
    lead_quality_score REAL,
    converted_to_lead INTEGER NOT NULL DEFAULT 0,
    total_cost REAL NOT NULL DEFAULT 0,
    started_at TEXT DEFAULT (datetime('now')),
    ended_at TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ai_chat_session ON ai_chat_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_user ON ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_status ON ai_chat_sessions(status);

-- AI Chat Messages Table
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    message_type TEXT NOT NULL CHECK(message_type IN ('user', 'ai', 'human', 'system')),
    message_content TEXT NOT NULL,
    ai_confidence REAL,
    tokens_used INTEGER,
    cost REAL,
    response_time_ms INTEGER,
    context_data TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES ai_chat_sessions(session_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ai_messages_session ON ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_type ON ai_chat_messages(message_type);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created ON ai_chat_messages(created_at);

-- =====================================================
-- ROCKET SITE - SOCIAL MEDIA TABLES
-- =====================================================

-- Social Media Post Queue Table
CREATE TABLE IF NOT EXISTS social_post_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL CHECK(platform IN ('linkedin', 'twitter', 'facebook', 'instagram')),
    content TEXT NOT NULL,
    media_url TEXT,
    blog_id INTEGER,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'posted', 'failed', 'cancelled')),
    scheduled_at TEXT NOT NULL,
    posted_at TEXT,
    external_post_id TEXT,
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_social_queue_status ON social_post_queue(status);
CREATE INDEX IF NOT EXISTS idx_social_queue_scheduled ON social_post_queue(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_social_queue_platform ON social_post_queue(platform);

-- Social Media Posts Log Table
CREATE TABLE IF NOT EXISTS social_media_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    platform TEXT NOT NULL,
    content TEXT NOT NULL,
    external_post_id TEXT,
    success INTEGER NOT NULL DEFAULT 1,
    error_message TEXT,
    engagement_count INTEGER DEFAULT 0,
    reach INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_media_posts(platform);
CREATE INDEX IF NOT EXISTS idx_social_posts_created ON social_media_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_social_posts_success ON social_media_posts(success);

-- =====================================================
-- ROCKET SITE - LEAD PROSPECTING TABLES
-- =====================================================

-- Leads Table
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    company TEXT,
    role TEXT,
    industry TEXT,
    company_size TEXT,
    website TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
    source TEXT,
    lead_score REAL,
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_score ON leads(lead_score);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);

-- Lead Outreach Templates Table
CREATE TABLE IF NOT EXISTS lead_outreach_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    approach TEXT NOT NULL,
    template_data TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0,
    response_received INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_outreach_lead ON lead_outreach_templates(lead_id);
CREATE INDEX IF NOT EXISTS idx_outreach_used ON lead_outreach_templates(used);

-- =====================================================
-- HOMEPAGE CONTENT TABLE
-- =====================================================

-- Homepage Content Table
CREATE TABLE IF NOT EXISTS homepage_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    section TEXT NOT NULL,
    content_key TEXT NOT NULL,
    content_value TEXT,
    content_type TEXT NOT NULL DEFAULT 'text',
    display_order INTEGER DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(section, content_key)
);

CREATE INDEX IF NOT EXISTS idx_homepage_section ON homepage_content(section);
CREATE INDEX IF NOT EXISTS idx_homepage_active ON homepage_content(is_active);

-- =====================================================
-- DEFAULT DATA INSERTION
-- =====================================================

-- Insert default admin user
INSERT OR IGNORE INTO users (email, password, name, role, status, email_verified) VALUES
('admin@adilcreator.com', '$2y$12$PXq0z7MbJKf/AQMEe6Fjsu6tZfjErrbYrGvtWyDnMa2my.xw46Xg2', 'Adil Creator Admin', 'admin', 'active', 1);

-- Insert default settings
INSERT OR IGNORE INTO settings (key, value, type, category, description) VALUES
('site_name', 'Adil Creator', 'text', 'general', 'Website name'),
('site_tagline', 'Professional Design & Creative Services', 'text', 'general', 'Website tagline'),
('contact_email', 'admin@adilcreator.com', 'email', 'general', 'Primary contact email'),
('site_url', 'https://adilcreator.com', 'url', 'general', 'Site URL');

-- Insert default categories
INSERT OR IGNORE INTO categories (name, slug, description, color, icon) VALUES
('Logo Design', 'logo-design', 'Professional logo design services', '#3B82F6', 'palette'),
('YouTube Thumbnails', 'youtube-thumbnails', 'Eye-catching YouTube thumbnail designs', '#FF0000', 'play-circle'),
('Video Editing', 'video-editing', 'Professional video editing and post-production', '#8B5CF6', 'film');

-- Insert feature toggles
INSERT OR IGNORE INTO feature_toggles (feature_key, feature_name, is_enabled, description, requires_api_keys) VALUES
('ai_content_generation', 'AI Content Generation', 1, 'Generate blog posts and content using AI', '["openai"]'),
('ai_chat_support', 'AI Chat Support', 1, '24/7 AI-powered customer support', '["openai"]'),
('social_media_automation', 'Social Media Automation', 0, 'Automated social media posting', '["linkedin","twitter","facebook"]'),
('lead_prospecting', 'Lead Prospecting', 0, 'Automated lead discovery and outreach', '["hunter","clearbit"]');

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps on users update
CREATE TRIGGER IF NOT EXISTS users_updated_at 
AFTER UPDATE ON users
BEGIN
    UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Update timestamps on blogs update
CREATE TRIGGER IF NOT EXISTS blogs_updated_at 
AFTER UPDATE ON blogs
BEGIN
    UPDATE blogs SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Update timestamps on portfolio update
CREATE TRIGGER IF NOT EXISTS portfolio_updated_at 
AFTER UPDATE ON portfolio
BEGIN
    UPDATE portfolio SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- Update timestamps on services update
CREATE TRIGGER IF NOT EXISTS services_updated_at 
AFTER UPDATE ON services
BEGIN
    UPDATE services SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- =====================================================
-- VIEWS FOR EASY QUERYING
-- =====================================================

-- API Keys Overview View
CREATE VIEW IF NOT EXISTS vw_api_keys_overview AS
SELECT 
    ak.id,
    ak.service_name,
    ak.display_name,
    ak.status,
    ak.is_enabled,
    ak.usage_count,
    ak.error_count,
    ak.last_tested,
    ak.test_result,
    ak.test_response_time_ms,
    ROUND(CAST(ak.error_count AS REAL) * 100.0 / NULLIF(ak.usage_count, 0), 2) as error_rate_percent,
    act.current_spend as month_spend,
    act.budget_limit as month_budget,
    ROUND(CAST(act.current_spend AS REAL) * 100.0 / NULLIF(act.budget_limit, 0), 2) as budget_used_percent,
    ak.created_at,
    ak.updated_at
FROM api_keys ak
LEFT JOIN api_cost_tracking act ON 
    ak.service_name = act.service_name 
    AND act.year = CAST(strftime('%Y', 'now') AS INTEGER)
    AND act.month = CAST(strftime('%m', 'now') AS INTEGER);

-- Recent API Usage View
CREATE VIEW IF NOT EXISTS vw_recent_api_usage AS
SELECT 
    aul.id,
    aul.service_name,
    aul.operation,
    aul.status_code,
    aul.success,
    aul.response_time_ms,
    aul.tokens_used,
    aul.cost,
    aul.error_message,
    aul.created_at,
    ak.display_name as service_display_name,
    u.name as user_name
FROM api_usage_logs aul
LEFT JOIN api_keys ak ON aul.service_name = ak.service_name
LEFT JOIN users u ON aul.user_id = u.id
ORDER BY aul.created_at DESC
LIMIT 100;

-- =====================================================
-- END OF SCHEMA
-- =====================================================

PRAGMA optimize;

-- Verify tables created
SELECT 'Schema created successfully. Total tables: ' || COUNT(*) FROM sqlite_master WHERE type='table';
