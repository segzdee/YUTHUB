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
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
