/**
 * Secure API client that uses httpOnly cookies for authentication
 * Replaces localStorage-based token storage to prevent XSS attacks
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with secure defaults
export const secureApi: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  withCredentials: true, // Always send cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// CSRF token storage (in memory, not localStorage)
let csrfToken: string | null = null;

/**
 * Get CSRF token from server
 */
export const fetchCSRFToken = async (): Promise<string> => {
  try {
    const response = await secureApi.get('/auth/csrf-token');
    csrfToken = response.data.token;
    return csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
    throw error;
  }
};

// Request interceptor
secureApi.interceptors.request.use(
  async (config) => {
    // Add CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(config.method?.toUpperCase() || '')) {
      if (!csrfToken) {
        await fetchCSRFToken();
      }
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
secureApi.interceptors.response.use(
  (response) => {
    // Check if token is expiring soon
    if (response.headers['x-token-expiring']) {
      // Trigger token refresh
      refreshAccessToken();
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Handle token expiration
    if (error.response?.status === 401) {
      const errorData = error.response.data as any;
      
      if (errorData?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          // Refresh the token
          await refreshAccessToken();
          
          // Retry the original request
          return secureApi(originalRequest);
        } catch (refreshError) {
          // Refresh failed, redirect to login
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
      
      // Other 401 errors - redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Handle CSRF token errors
    if (error.response?.status === 403) {
      const errorData = error.response.data as any;
      
      if (errorData?.error === 'Invalid CSRF token') {
        // Fetch new CSRF token and retry
        csrfToken = null;
        await fetchCSRFToken();
        return secureApi(originalRequest);
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Refresh access token using refresh token cookie
 */
const refreshAccessToken = async (): Promise<void> => {
  try {
    const response = await secureApi.post('/auth/refresh');
    
    if (!response.data.success) {
      throw new Error('Token refresh failed');
    }
    
    // Token is automatically set as httpOnly cookie by server
  } catch (error) {
    console.error('Failed to refresh token:', error);
    throw error;
  }
};

/**
 * Authentication methods using secure cookies
 */
export const authApi = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string) => {
    const response = await secureApi.post('/auth/login', { email, password });
    
    // Server sets httpOnly cookies automatically
    // Return user data
    return response.data;
  },
  
  /**
   * Register new user
   */
  register: async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    tosAccepted: boolean;
  }) => {
    const response = await secureApi.post('/auth/register', userData);
    return response.data;
  },
  
  /**
   * Logout and clear cookies
   */
  logout: async () => {
    try {
      await secureApi.post('/auth/logout');
    } finally {
      // Clear CSRF token from memory
      csrfToken = null;
      
      // Redirect to login
      window.location.href = '/login';
    }
  },
  
  /**
   * Get current user from server
   */
  getCurrentUser: async () => {
    const response = await secureApi.get('/auth/me');
    return response.data;
  },
  
  /**
   * Check authentication status
   */
  checkAuth: async (): Promise<boolean> => {
    try {
      await secureApi.get('/auth/check');
      return true;
    } catch (error) {
      return false;
    }
  },
};

/**
 * Secure API methods for protected resources
 */
export const api = {
  // User management
  users: {
    list: () => secureApi.get('/api/users'),
    get: (id: string) => secureApi.get(`/api/users/${id}`),
    update: (id: string, data: any) => secureApi.put(`/api/users/${id}`, data),
    delete: (id: string) => secureApi.delete(`/api/users/${id}`),
  },
  
  // Tenant management
  tenants: {
    list: () => secureApi.get('/api/tenants'),
    get: (id: string) => secureApi.get(`/api/tenants/${id}`),
    create: (data: any) => secureApi.post('/api/tenants', data),
    update: (id: string, data: any) => secureApi.put(`/api/tenants/${id}`, data),
    delete: (id: string) => secureApi.delete(`/api/tenants/${id}`),
  },
  
  // Resident management  
  residents: {
    list: () => secureApi.get('/api/residents'),
    get: (id: string) => secureApi.get(`/api/residents/${id}`),
    create: (data: any) => secureApi.post('/api/residents', data),
    update: (id: string, data: any) => secureApi.put(`/api/residents/${id}`, data),
    delete: (id: string) => secureApi.delete(`/api/residents/${id}`),
  },
  
  // Property management
  properties: {
    list: () => secureApi.get('/api/properties'),
    get: (id: string) => secureApi.get(`/api/properties/${id}`),
    create: (data: any) => secureApi.post('/api/properties', data),
    update: (id: string, data: any) => secureApi.put(`/api/properties/${id}`, data),
    delete: (id: string) => secureApi.delete(`/api/properties/${id}`),
  },
};

export default secureApi;