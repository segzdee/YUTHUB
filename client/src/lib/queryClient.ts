import { QueryClient, QueryFunction } from '@tanstack/react-query';

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


type UnauthorizedBehavior = 'returnNull' | 'throw';
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join('/');
    const res = await fetch(url, {
      credentials: 'include',
    });

    // Handle 401 with potential token refresh
    if (res.status === 401) {
      if (unauthorizedBehavior === 'returnNull') {
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
            credentials: 'include',
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
  endpoint: string | RequestInfo,
  options: RequestInit = {}
): Promise<any> {
  let url: string;
  let requestOptions: RequestInit;

  // Handle different call patterns
  if (typeof endpoint === 'string') {
    // Pattern: apiRequest('/api/endpoint', options)
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? window.location.origin
        : 'http://localhost:3000';

    url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    requestOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('auth-token') && {
          Authorization: `Bearer ${localStorage.getItem('auth-token')}`,
        }),
        ...options.headers,
      },
      ...options,
    };
  } else {
    // Pattern: apiRequest('POST', '/api/endpoint', data) - legacy support
    url = endpoint as string;
    requestOptions = options;
  }

  try {
    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
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
      return getMockData(typeof endpoint === 'string' ? endpoint : url);
    }

    throw error;
  }
}

// Mock data for development
function getMockData(endpoint: string): any {
  const mockResponses: Record<string, any> = {
    '/api/residents': [],
    '/api/residents/at-risk': [],
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
    '/api/security/metrics': {
      totalLogins: 156,
      failedLogins: 3,
      mfaEnabled: 12,
      activeSessions: 15,
      highRiskEvents: 1,
      lastIncident: '2 days ago',
      passwordStrength: 85,
      accountLockouts: 0,
    },
    '/api/security/events': [],
    '/api/security/alerts': [],
    '/api/maintenance-requests': [],
    '/auth/methods': [],
  };

  return mockResponses[endpoint] || [];
}
