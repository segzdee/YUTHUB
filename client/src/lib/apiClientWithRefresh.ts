import { supabase } from './supabase';

interface RequestConfig extends RequestInit {
  url: string;
  retryCount?: number;
}

const MAX_RETRIES = 1;

/**
 * API client with automatic token refresh on 401 errors
 * This ensures seamless authentication when tokens expire
 */
export async function fetchWithAuth(config: RequestConfig): Promise<Response> {
  const { url, retryCount = 0, ...fetchOptions } = config;

  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      // No session - redirect to login
      window.location.href = '/login';
      throw new Error('No active session');
    }

    // Add authorization header
    const headers = new Headers(fetchOptions.headers);
    headers.set('Authorization', `Bearer ${session.access_token}`);

    // Make request
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Check if we got a 401 (unauthorized)
    if (response.status === 401 && retryCount < MAX_RETRIES) {
      console.log('Token expired, attempting refresh...');

      // Try to refresh the session
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();

      if (refreshError || !newSession) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed - clear state and redirect to login
        await supabase.auth.signOut();
        window.location.href = '/login';
        throw new Error('Session refresh failed');
      }

      console.log('Token refreshed successfully, retrying request...');

      // Retry the original request with new token
      return fetchWithAuth({
        ...config,
        retryCount: retryCount + 1,
      });
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

/**
 * Helper methods for common HTTP verbs
 */
export const api = {
  get: async (url: string, options?: Omit<RequestConfig, 'url' | 'method'>) => {
    return fetchWithAuth({ url, method: 'GET', ...options });
  },

  post: async (url: string, data?: any, options?: Omit<RequestConfig, 'url' | 'method' | 'body'>) => {
    return fetchWithAuth({
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  },

  put: async (url: string, data?: any, options?: Omit<RequestConfig, 'url' | 'method' | 'body'>) => {
    return fetchWithAuth({
      url,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  },

  patch: async (url: string, data?: any, options?: Omit<RequestConfig, 'url' | 'method' | 'body'>) => {
    return fetchWithAuth({
      url,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  },

  delete: async (url: string, options?: Omit<RequestConfig, 'url' | 'method'>) => {
    return fetchWithAuth({ url, method: 'DELETE', ...options });
  },
};

/**
 * Parse JSON response with error handling
 */
export async function parseResponse<T = any>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Complete API call with automatic JSON parsing
 */
export const apiCall = {
  get: async <T = any>(url: string, options?: Omit<RequestConfig, 'url' | 'method'>): Promise<T> => {
    const response = await api.get(url, options);
    return parseResponse<T>(response);
  },

  post: async <T = any>(url: string, data?: any, options?: Omit<RequestConfig, 'url' | 'method' | 'body'>): Promise<T> => {
    const response = await api.post(url, data, options);
    return parseResponse<T>(response);
  },

  put: async <T = any>(url: string, data?: any, options?: Omit<RequestConfig, 'url' | 'method' | 'body'>): Promise<T> => {
    const response = await api.put(url, data, options);
    return parseResponse<T>(response);
  },

  patch: async <T = any>(url: string, data?: any, options?: Omit<RequestConfig, 'url' | 'method' | 'body'>): Promise<T> => {
    const response = await api.patch(url, data, options);
    return parseResponse<T>(response);
  },

  delete: async <T = any>(url: string, options?: Omit<RequestConfig, 'url' | 'method'>): Promise<T> => {
    const response = await api.delete(url, options);
    return parseResponse<T>(response);
  },
};
