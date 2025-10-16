/**
 * Admin API Service Layer
 * Handles all admin-specific API calls with authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/backend';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class AdminApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

function getAuthToken(): string {
  return localStorage.getItem('auth_token') || '';
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/user/login';
      throw new AdminApiError('Unauthorized', 401);
    }

    const data = await response.json();

    if (!response.ok) {
      throw new AdminApiError(
        data.error || data.message || 'Request failed',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof AdminApiError) {
      throw error;
    }
    throw new AdminApiError(
      error instanceof Error ? error.message : 'Network error',
      0
    );
  }
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author_id: number;
  author?: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  featured_image: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  status: 'draft' | 'published' | 'archived';
  views: number;
  likes: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  featured_image: string;
  tags: string[];
  featured: boolean;
  published: boolean;
  status: 'draft' | 'published' | 'archived';
}

export interface PricingTier {
  name: string;
  price: number;
  duration: string;
  features: string[];
  popular?: boolean;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  icon: string;
  tagline: string;
  description: string;
  features: string[];
  pricingTiers: PricingTier[];
  deliveryTime: string;
  popular: boolean;
  active: boolean;
  created_at?: string;
  updated_at?: string;
  testimonialIds?: number[];
}

export interface ServiceFormData {
  name: string;
  tagline: string;
  description: string;
  icon: string;
  features: string[];
  pricingTiers: PricingTier[];
  deliveryTime: string;
  popular: boolean;
  active: boolean;
}

export interface Portfolio {
  id: number;
  title: string;
  slug: string;
  category: string;
  description: string;
  longDescription?: string;
  client?: string;
  completionDate?: string;
  featuredImage: string;
  images: string[];
  beforeImage?: string;
  afterImage?: string;
  tags: string[];
  technologies?: string[];
  projectUrl?: string;
  results?: {
    metric1?: string;
    metric2?: string;
    metric3?: string;
  };
  featured: boolean;
  status: 'active' | 'archived' | 'draft';
  views: number;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioFormData {
  title: string;
  category: string;
  description: string;
  longDescription?: string;
  client?: string;
  completionDate?: string;
  featuredImage: string;
  images: string[];
  tags: string[];
  technologies?: string[];
  projectUrl?: string;
  featured: boolean;
  status: 'active' | 'archived' | 'draft';
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: string;
  featured: boolean;
  status: 'active' | 'archived' | 'pending';
  created_at?: string;
  updated_at?: string;
}

export interface TestimonialFormData {
  name: string;
  role: string;
  company?: string;
  content: string;
  rating: number;
  avatar?: string;
  featured: boolean;
  status: 'active' | 'archived' | 'pending';
}

export interface Setting {
  id: number;
  key: string;
  value: string;
  type: 'text' | 'number' | 'boolean' | 'json' | 'url' | 'email' | 'color';
  category: 'general' | 'seo' | 'appearance' | 'social' | 'api';
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SettingsFormData {
  site_name?: string;
  site_tagline?: string;
  contact_email?: string;
  contact_phone?: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  dark_mode_enabled?: boolean;
}

export interface ProfileFormData {
  name: string;
  email: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  avatar?: string;
}

export interface AdminProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  created_at: string;
}

export interface MediaFile {
  id: number;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  altText?: string;
  caption?: string;
  uploadedBy: number;
  uploadedAt: string;
  updatedAt?: string;
}

export interface MediaLibraryResponse {
  files: MediaFile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MediaUploadData {
  file: File;
  altText?: string;
  caption?: string;
}

export interface MediaUpdateData {
  altText?: string;
  caption?: string;
}

export interface DashboardStats {
  total_users: number;
  total_blogs: number;
  total_contacts: number;
  total_tokens: number;
  new_users_month: number;
  popular_blogs: Array<{ id: number; title: string; views: number }>;
}

export interface ActivityItem {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface Notification {
  id: number;
  type: 'system' | 'user' | 'security' | 'content' | 'info';
  title: string;
  message: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName?: string;
  action: string;
  entity: string;
  entityId?: number;
  changes?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  status: 'success' | 'failed';
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  status: 'draft' | 'published';
  order?: number;
  featured: boolean;
  views?: number;
  helpful_votes?: number;
  created_at: string;
  updated_at: string;
}

export interface FAQFormData {
  question: string;
  answer: string;
  category: string;
  status: 'draft' | 'published';
  order?: number;
  featured: boolean;
}

export const adminApi = {
  auth: {
    login: async (email: string, password: string) => {
      return request<ApiResponse<{ token: string; user: any }>>('/api/auth.php/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    },

    verify: async () => {
      return request<ApiResponse<{ user: any }>>('/api/auth.php/verify');
    },

    logout: () => {
      localStorage.removeItem('auth_token');
      window.location.href = '/user/login';
    },
  },

  stats: {
    getDashboard: async () => {
      return request<ApiResponse<DashboardStats>>('/api/admin/stats.php');
    },
  },

  activity: {
    getRecent: async (limit: number = 10) => {
      return request<ApiResponse<{ activities: ActivityItem[] }>>(
        `/api/admin/activity.php?limit=${limit}`
      );
    },
  },

  blogs: {
    getAll: async () => {
      return request<ApiResponse<{ blogs: Blog[] }>>('/api/admin/blogs.php');
    },

    getById: async (id: number) => {
      return request<ApiResponse<{ blog: Blog }>>(`/api/blogs.php/${id}`);
    },

    create: async (data: BlogFormData) => {
      return request<ApiResponse<{ id: number }>>('/api/admin/blogs.php', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: BlogFormData) => {
      return request<ApiResponse>(`/api/admin/blogs.php/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return request<ApiResponse>(`/api/admin/blogs.php/${id}`, {
        method: 'DELETE',
      });
    },

    uploadImage: async (file: File) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/uploads.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AdminApiError(error.error || 'Upload failed', response.status);
      }

      return response.json();
    },
  },

  services: {
    getAll: async () => {
      return request<ApiResponse<Service[]>>('/api/services.php');
    },

    getById: async (id: number) => {
      return request<ApiResponse<Service>>(`/api/services.php/${id}`);
    },

    create: async (data: ServiceFormData) => {
      return request<ApiResponse<{ id: number }>>('/api/services.php', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: ServiceFormData) => {
      return request<ApiResponse>(`/api/services.php/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return request<ApiResponse>(`/api/services.php/${id}`, {
        method: 'DELETE',
      });
    },
  },

  portfolio: {
    getAll: async () => {
      return request<ApiResponse<Portfolio[]>>('/api/portfolio.php');
    },

    getById: async (id: number) => {
      return request<ApiResponse<Portfolio>>(`/api/portfolio.php/${id}`);
    },

    create: async (data: PortfolioFormData) => {
      return request<ApiResponse<{ id: number }>>('/api/portfolio.php', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: PortfolioFormData) => {
      return request<ApiResponse>(`/api/portfolio.php/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return request<ApiResponse>(`/api/portfolio.php/${id}`, {
        method: 'DELETE',
      });
    },

    uploadImage: async (file: File) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/uploads.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AdminApiError(error.error || 'Upload failed', response.status);
      }

      return response.json();
    },
  },

  testimonials: {
    getAll: async () => {
      return request<ApiResponse<Testimonial[]>>('/api/testimonials.php');
    },

    getById: async (id: number) => {
      return request<ApiResponse<Testimonial>>(`/api/testimonials.php/${id}`);
    },

    create: async (data: TestimonialFormData) => {
      return request<ApiResponse<{ id: number }>>('/api/testimonials.php', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: TestimonialFormData) => {
      return request<ApiResponse>(`/api/testimonials.php/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return request<ApiResponse>(`/api/testimonials.php/${id}`, {
        method: 'DELETE',
      });
    },

    uploadAvatar: async (file: File) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/uploads.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AdminApiError(error.error || 'Upload failed', response.status);
      }

      return response.json();
    },
  },

  settings: {
    getAll: async () => {
      return request<ApiResponse<Setting[]>>('/api/settings.php');
    },

    getByCategory: async (category: string) => {
      return request<ApiResponse<Setting[]>>(`/api/settings.php/category/${category}`);
    },

    get: async (key: string) => {
      return request<ApiResponse<{ value: string }>>(`/api/settings.php/${key}`);
    },

    update: async (key: string, value: string, type: string = 'text') => {
      return request<ApiResponse>(`/api/settings.php/${key}`, {
        method: 'PUT',
        body: JSON.stringify({ value, type }),
      });
    },

    bulkUpdate: async (settings: Record<string, any>) => {
      return request<ApiResponse>('/api/settings.php/bulk', {
        method: 'PUT',
        body: JSON.stringify({ settings }),
      });
    },

    uploadFile: async (file: File) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/uploads.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AdminApiError(error.error || 'Upload failed', response.status);
      }

      return response.json();
    },
  },

  profile: {
    get: async () => {
      return request<ApiResponse<AdminProfile>>('/api/user/profile.php');
    },

    update: async (data: ProfileFormData) => {
      return request<ApiResponse>('/api/user/profile.php', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    updatePassword: async (currentPassword: string, newPassword: string) => {
      return request<ApiResponse>('/api/user/profile.php/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
    },

    uploadAvatar: async (file: File) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/uploads.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AdminApiError(error.error || 'Upload failed', response.status);
      }

      return response.json();
    },
  },

  notifications: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      type?: string;
      read?: boolean;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.type) searchParams.append('type', params.type);
      if (params?.read !== undefined) searchParams.append('read', params.read.toString());

      const query = searchParams.toString();
      return request<ApiResponse<{
        notifications: Notification[];
        total: number;
        unread: number;
        page: number;
        limit: number;
      }>>(`/api/admin/notifications.php${query ? `?${query}` : ''}`);
    },

    getUnreadCount: async () => {
      return request<ApiResponse<{ count: number }>>('/api/admin/notifications.php?unread_count=true');
    },

    markAsRead: async (id: number) => {
      return request<ApiResponse>(`/api/admin/notifications.php/${id}/read`, {
        method: 'PUT',
      });
    },

    markAllAsRead: async () => {
      return request<ApiResponse>('/api/admin/notifications.php/mark-all-read', {
        method: 'PUT',
      });
    },

    delete: async (id: number) => {
      return request<ApiResponse>(`/api/admin/notifications.php/${id}`, {
        method: 'DELETE',
      });
    },

    deleteAll: async () => {
      return request<ApiResponse>('/api/admin/notifications.php/delete-all', {
        method: 'DELETE',
      });
    },
  },

  auditLogs: {
    getAll: async (params?: {
      page?: number;
      limit?: number;
      userId?: number;
      action?: string;
      entity?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.userId) searchParams.append('userId', params.userId.toString());
      if (params?.action) searchParams.append('action', params.action);
      if (params?.entity) searchParams.append('entity', params.entity);
      if (params?.startDate) searchParams.append('startDate', params.startDate);
      if (params?.endDate) searchParams.append('endDate', params.endDate);

      const query = searchParams.toString();
      return request<ApiResponse<{
        logs: AuditLog[];
        total: number;
        page: number;
        limit: number;
      }>>(`/api/admin/audit.php${query ? `?${query}` : ''}`);
    },

    getById: async (id: number) => {
      return request<ApiResponse<{ log: AuditLog }>>(`/api/admin/audit.php/${id}`);
    },
  },

  faqs: {
    getAll: async () => {
      return request<ApiResponse<FAQ[]>>('/api/faqs.php');
    },

    getById: async (id: number) => {
      return request<ApiResponse<FAQ>>(`/api/faqs.php/${id}`);
    },

    create: async (data: FAQFormData) => {
      return request<ApiResponse<{ id: number }>>('/api/faqs.php', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: FAQFormData) => {
      return request<ApiResponse>(`/api/faqs.php/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return request<ApiResponse>(`/api/faqs.php/${id}`, {
        method: 'DELETE',
      });
    },

    bulkUpdate: async (updates: Array<{ id: number; order?: number; status?: string }>) => {
      return request<ApiResponse>('/api/faqs.php/bulk-update', {
        method: 'POST',
        body: JSON.stringify({ updates }),
      });
    },
  },

  media: {
    getAll: async (page: number = 1, limit: number = 20, type?: string) => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (type) params.append('type', type);

      return request<MediaLibraryResponse>(`/api/uploads.php?${params.toString()}`);
    },

    getById: async (id: number) => {
      return request<ApiResponse<{ file: MediaFile }>>(`/api/uploads.php/${id}`);
    },

    upload: async (data: MediaUploadData) => {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append('file', data.file);
      if (data.altText) formData.append('altText', data.altText);
      if (data.caption) formData.append('caption', data.caption);

      const response = await fetch(`${API_BASE_URL}/api/uploads.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new AdminApiError(error.error || 'Upload failed', response.status);
      }

      return response.json();
    },

    update: async (id: number, data: MediaUpdateData) => {
      return request<ApiResponse>(`/api/uploads.php/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return request<ApiResponse>(`/api/uploads.php/${id}`, {
        method: 'DELETE',
      });
    },
  },
};

export { AdminApiError };

// Export the request function as apiRequest for backward compatibility
export const apiRequest = request;

export default adminApi;
