/**
 * API Client with multi-tenant support and automatic token refresh
 */

interface RequestOptions extends RequestInit {
  organizationId?: number;
  retryCount?: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    timestamp: string;
    organizationId?: number;
  };
}

class APIClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshPromise: Promise<boolean> | null = null;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  constructor(baseURL: string = process.env.REACT_APP_API_URL || 'http://localhost:5000') {
    this.baseURL = baseURL;
    this.accessToken = localStorage.getItem('access_token');
  }

  private getAccessToken(): string | null {
    return this.accessToken || localStorage.getItem('access_token');
  }

  public setAccessToken(token: string): void {
    this.accessToken = token;
    localStorage.setItem('access_token', token);
  }

  public clearAuth(): void {
    this.accessToken = null;
    localStorage.removeItem('access_token');
  }

  private async refreshToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data: ApiResponse<{ accessToken: string }> = await response.json();

        if (data.data?.accessToken) {
          this.setAccessToken(data.data.accessToken);
          return true;
        }

        return false;
      } catch (error) {
        console.error('Token refresh error:', error);
        this.clearAuth();
        window.location.href = '/login';
        return false;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { organizationId, retryCount = 0, ...fetchOptions } = options;

    const url = `${this.baseURL}${endpoint}`;
    const headers = new Headers(fetchOptions.headers);

    const token = this.getAccessToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (organizationId) {
      headers.set('X-Organization-Id', organizationId.toString());
    }

    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers,
        credentials: 'include',
      });

      if (response.status === 401 && retryCount < this.maxRetries) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          return this.request<T>(endpoint, {
            ...options,
            retryCount: retryCount + 1,
          });
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data: ApiResponse<T> = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Request failed');
      }

      return data.data as T;
    } catch (error) {
      console.error('API request error:', {
        endpoint,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  public get<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  public post<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

export const apiClient = new APIClient();

export default APIClient;
