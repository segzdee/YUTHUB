import { useState, useEffect, useRef } from "react";

// Global auth state cache to prevent multiple simultaneous requests
let authCache: {
  user: any;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  timestamp: number;
  promise?: Promise<any>;
} | null = null;

const CACHE_DURATION = 30000; // 30 seconds cache

export function useAuth() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [user, setUser] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    let timeoutId: NodeJS.Timeout;

    const checkAuth = async () => {
      try {
        // Check if we have valid cached data
        if (authCache && (Date.now() - authCache.timestamp) < CACHE_DURATION) {
          if (mounted.current) {
            setUser(authCache.user);
            setAuthStatus(authCache.status);
          }
          return;
        }

        // If there's already a request in progress, wait for it
        if (authCache?.promise) {
          await authCache.promise;
          if (mounted.current && authCache) {
            setUser(authCache.user);
            setAuthStatus(authCache.status);
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
            setUser(userData);
            setAuthStatus('authenticated');
          }
        } else {
          authCache = {
            user: null,
            status: 'unauthenticated',
            timestamp: Date.now(),
          };
          if (mounted.current) {
            setUser(null);
            setAuthStatus('unauthenticated');
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
          setUser(null);
          setAuthStatus('unauthenticated');
        }
      }
    };

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (mounted.current && authStatus === 'loading') {
        setAuthStatus('unauthenticated');
      }
    }, 3000); // 3 seconds timeout

    checkAuth();

    return () => {
      mounted.current = false;
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    user,
    isLoading: authStatus === 'loading',
    isAuthenticated: authStatus === 'authenticated',
  };
}
