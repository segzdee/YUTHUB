import { useState, useEffect } from "react";

export function useAuth() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [user, setUser] = useState(null);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include',
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setAuthStatus('authenticated');
        } else {
          setUser(null);
          setAuthStatus('unauthenticated');
        }
      } catch (error) {
        console.error('Authentication check failed:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        });
        setUser(null);
        setAuthStatus('unauthenticated');
      }
    };

    // Set a timeout to prevent infinite loading
    timeoutId = setTimeout(() => {
      if (authStatus === 'loading') {
        setAuthStatus('unauthenticated');
      }
    }, 3000); // 3 seconds timeout

    checkAuth();

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return {
    user,
    isLoading: authStatus === 'loading',
    isAuthenticated: authStatus === 'authenticated',
  };
}
