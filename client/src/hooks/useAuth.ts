import { useEffect, useRef, useState } from "react";

// Global auth state cache to prevent multiple simultaneous requests
let authCache: {
  user: any;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  timestamp: number;
  promise?: Promise<any>;
} | null = null;

const CACHE_DURATION = 30000; // 30 seconds cache

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  maxResidents?: number;
  subscriptionTier?: string;
  subscriptionStatus?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let timeoutId: NodeJS.Timeout;

    const checkAuth = async () => {
      try {
        // Check if we have valid cached data
        if (authCache && (Date.now() - authCache.timestamp) < CACHE_DURATION) {
          if (mounted.current) {
            setAuthState({
              user: authCache.user,
              isLoading: false,
              isAuthenticated: authCache.status === 'authenticated',
            });
          }
          return;
        }

        // If there's already a request in progress, wait for it
        if (authCache?.promise) {
          await authCache.promise;
          if (mounted.current && authCache) {
            setAuthState({
              user: authCache.user,
              isLoading: false,
              isAuthenticated: authCache.status === 'authenticated',
            });
          }
          return;
        }

        // Create new request
        const authPromise = fetch('/api/auth/user', {
          credentials: 'include',
        });

        // Cache the promise to prevent duplicate requests
        authCache = {
          user: null,
          status: 'loading',
          timestamp: Date.now(),
          promise: authPromise,
        };

        const response = await authPromise;

        if (response.ok) {
          const userData = await response.json();
          authCache = {
            user: userData,
            status: 'authenticated',
            timestamp: Date.now(),
          };
          if (mounted.current) {
            setAuthState({
              user: userData,
              isLoading: false,
              isAuthenticated: true,
            });
          }
        } else {
          authCache = {
            user: null,
            status: 'unauthenticated',
            timestamp: Date.now(),
          };
          if (mounted.current) {
            setAuthState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        }
      } catch (error) {
        // Log authentication errors in development
        if (process.env.NODE_ENV === 'development') {
          console.error('Authentication check failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
          });
        }
        authCache = {
          user: null,
          status: 'unauthenticated',
          timestamp: Date.now(),
        };
        if (mounted.current) {
          setAuthState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    };

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted.current && authState.isLoading) {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    }, 3000); // 3 seconds timeout

    checkAuth();

    return () => {
      mounted.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return authState;
}
