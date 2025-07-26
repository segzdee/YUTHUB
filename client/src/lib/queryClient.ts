import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    const error = new Error(`${res.status}: ${text}`);
    error.name = `HttpError${res.status}`;
    
    // Log structured error information in development
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', {
        url: res.url,
        status: res.status,
        statusText: res.statusText,
        message: text,
        timestamp: new Date().toISOString(),
      });
    }
    
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // If we get a 401, try to refresh the session by making a simple request
  if (res.status === 401) {
    console.log('Received 401, attempting to refresh session...');
    try {
      const refreshRes = await fetch('/api/auth/user', {
        credentials: 'include',
      });
      
      if (refreshRes.ok) {
        // Session refreshed, retry the original request
        console.log('Session refreshed, retrying original request...');
        const retryRes = await fetch(url, {
          method,
          headers: data ? { "Content-Type": "application/json" } : {},
          body: data ? JSON.stringify(data) : undefined,
          credentials: "include",
        });
        
        if (retryRes.ok) {
          return retryRes;
        }
      }
    } catch (refreshError) {
      console.error('Session refresh failed:', refreshError);
    }
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/") as string;
    const res = await fetch(url, {
      credentials: "include",
    });

    // Handle 401 with potential token refresh
    if (res.status === 401) {
      if (unauthorizedBehavior === "returnNull") {
        return null;
      }

      // Try to refresh the session
      try {
        const refreshRes = await fetch('/api/auth/user', {
          credentials: 'include',
        });
        
        if (refreshRes.ok) {
          // Session refreshed, retry the original request
          const retryRes = await fetch(url, {
            credentials: "include",
          });
          
          if (retryRes.ok) {
            return await retryRes.json();
          }
        }
      } catch (refreshError) {
        console.error('Session refresh failed during query:', refreshError);
      }
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

// API request helper with proper error handling
export async function apiRequest(
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? window.location.origin 
    : 'http://localhost:3000';

  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      // Add auth token if available
      ...(localStorage.getItem('auth-token') && {
        'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
      }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    console.error('API Request failed:', error);
    
    // Return mock data for development when API is not available
    if (process.env.NODE_ENV === 'development') {
      return getMockData(endpoint);
    }
    
    throw error;
  }
}

// Mock data for development
function getMockData(endpoint: string): any {
  const mockResponses: Record<string, any> = {
    '/api/residents': [],
    '/api/properties': [],
    '/api/incidents': [],
    '/api/support-plans': [],
    '/api/financial-records': [],
    '/api/invoices': [],
    '/api/activities': [],
    '/api/dashboard/metrics': {
      totalProperties: 12,
      currentResidents: 48,
      occupancyRate: 85,
      activeIncidents: 2,
    },
    '/api/billing/government-clients': [],
    '/api/security/settings': {
      mfaEnabled: false,
      role: 'staff',
      permissions: ['read_residents', 'write_incidents'],
    },
    '/api/security/sessions': [],
    '/api/audit-logs': [],
  };

  return mockResponses[endpoint] || [];
}
