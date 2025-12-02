import { supabase } from './supabase';

interface RequestConfig extends RequestInit {
  retry?: boolean;
  maxRetries?: number;
  timeout?: number;
}

interface QueuedRequest {
  url: string;
  config: RequestConfig;
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

class ApiClient {
  private baseURL: string;
  private offlineQueue: QueuedRequest[] = [];
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.baseURL = import.meta.env.VITE_APP_URL || 'http://localhost:5000';
    this.setupOnlineListener();
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  private async processOfflineQueue() {
    console.log(`Processing ${this.offlineQueue.length} queued requests`);

    while (this.offlineQueue.length > 0 && this.isOnline) {
      const request = this.offlineQueue.shift();
      if (request) {
        try {
          const response = await this.fetchWithRetry(request.url, request.config);
          request.resolve(response);
        } catch (error) {
          request.reject(error);
        }
      }
    }
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private calculateBackoff(attempt: number): number {
    const baseDelay = 1000;
    const maxDelay = 30000;
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    const jitter = Math.random() * 0.3 * delay;
    return delay + jitter;
  }

  private shouldRetry(status: number, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) return false;
    if (status >= 500 && status < 600) return true;
    if (status === 429) return true;
    if (status === 408) return true;
    return false;
  }

  private async fetchWithRetry(
    url: string,
    config: RequestConfig = {}
  ): Promise<Response> {
    const {
      retry = true,
      maxRetries = 3,
      timeout = 30000,
      ...fetchConfig
    } = config;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchConfig,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return response;
        }

        if (!retry || !this.shouldRetry(response.status, attempt, maxRetries)) {
          return response;
        }

        if (attempt < maxRetries) {
          const backoffDelay = this.calculateBackoff(attempt);
          console.log(`Request failed with status ${response.status}. Retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await this.delay(backoffDelay);
        }

        lastError = new Error(`Request failed with status ${response.status}`);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          lastError = new Error('Request timeout');
        } else {
          lastError = error;
        }

        if (attempt < maxRetries && retry) {
          const backoffDelay = this.calculateBackoff(attempt);
          console.log(`Request failed: ${error.message}. Retrying in ${backoffDelay}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await this.delay(backoffDelay);
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'GET',
      headers: { ...headers, ...config?.headers },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    if (!this.isOnline && config?.retry !== false) {
      return new Promise((resolve, reject) => {
        this.offlineQueue.push({
          url,
          config: {
            ...config,
            method: 'POST',
            headers: { ...headers, ...config?.headers },
            body: JSON.stringify(data),
          },
          resolve,
          reject,
        });
      });
    }

    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'POST',
      headers: { ...headers, ...config?.headers },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async patch<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    if (!this.isOnline && config?.retry !== false) {
      return new Promise((resolve, reject) => {
        this.offlineQueue.push({
          url,
          config: {
            ...config,
            method: 'PATCH',
            headers: { ...headers, ...config?.headers },
            body: JSON.stringify(data),
          },
          resolve,
          reject,
        });
      });
    }

    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'PATCH',
      headers: { ...headers, ...config?.headers },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getAuthHeaders();

    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'DELETE',
      headers: { ...headers, ...config?.headers },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  getQueueLength(): number {
    return this.offlineQueue.length;
  }

  isOffline(): boolean {
    return !this.isOnline;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
