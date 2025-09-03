import { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwtService';

/**
 * Secure cookie-based authentication middleware
 * Uses httpOnly cookies to prevent XSS token theft
 */

export interface AuthCookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  path?: string;
}

/**
 * Get secure cookie options based on environment
 */
export const getSecureCookieOptions = (): AuthCookieOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return {
    httpOnly: true, // Prevent JavaScript access (XSS protection)
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/',
  };
};

/**
 * Set authentication tokens in secure httpOnly cookies
 */
export const setAuthCookies = (
  res: Response, 
  accessToken: string, 
  refreshToken: string
): void => {
  const cookieOptions = getSecureCookieOptions();
  
  // Set access token cookie
  res.cookie('access_token', accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
  
  // Set refresh token cookie (longer expiry)
  res.cookie('refresh_token', refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/auth/refresh', // Restrict refresh token to refresh endpoint
  });
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = (res: Response): void => {
  const cookieOptions = getSecureCookieOptions();
  
  res.clearCookie('access_token', cookieOptions);
  res.clearCookie('refresh_token', { ...cookieOptions, path: '/auth/refresh' });
};

/**
 * Extract and verify authentication from cookies
 */
export const cookieAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get access token from cookie
    const accessToken = req.cookies?.access_token;
    
    if (!accessToken) {
      // Try to refresh if refresh token exists
      const refreshToken = req.cookies?.refresh_token;
      
      if (refreshToken && req.path === '/auth/refresh') {
        // Allow refresh endpoint to handle token refresh
        return next();
      }
      
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Verify the access token
    try {
      const payload = jwtService.verifyAccessToken(accessToken);
      
      // Attach user info to request
      (req as any).user = {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
      };
      
      // Check if token is about to expire (less than 5 minutes)
      const tokenData = jwtService.decodeToken(accessToken);
      const expiresIn = (tokenData.exp * 1000) - Date.now();
      
      if (expiresIn < 5 * 60 * 1000) {
        // Set header to indicate token should be refreshed
        res.setHeader('X-Token-Expiring', 'true');
      }
      
      next();
    } catch (error: any) {
      if (error.message === 'Access token has expired') {
        // Token expired, client should refresh
        return res.status(401).json({ 
          error: 'Token expired', 
          code: 'TOKEN_EXPIRED' 
        });
      }
      
      // Invalid token
      clearAuthCookies(res);
      return res.status(401).json({ error: 'Invalid authentication token' });
    }
  } catch (error) {
    console.error('Cookie auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

/**
 * Refresh token endpoint handler
 */
export const refreshTokenHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }
    
    // Verify refresh token
    const { userId } = jwtService.verifyRefreshToken(refreshToken);
    
    // Get user data (you'll need to implement this based on your user service)
    const getUserData = async (id: string) => {
      // This should fetch from your database
      const { db } = await import('../db');
      const { users } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return user[0];
    };
    
    // Generate new token pair
    const userData = await getUserData(userId);
    
    if (!userData) {
      clearAuthCookies(res);
      return res.status(401).json({ error: 'User not found' });
    }
    
    const { accessToken, refreshToken: newRefreshToken } = jwtService.generateTokenPair({
      userId: userData.id,
      email: userData.email,
      role: userData.role || 'user',
      tenantId: userData.tenantId,
    });
    
    // Set new cookies
    setAuthCookies(res, accessToken, newRefreshToken);
    
    res.json({ 
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        role: userData.role,
      }
    });
  } catch (error: any) {
    console.error('Token refresh error:', error);
    clearAuthCookies(res);
    res.status(401).json({ error: 'Failed to refresh token' });
  }
};

/**
 * CSRF token middleware for additional protection
 */
export const csrfProtection = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'] || req.body?._csrf;
  const sessionCsrf = (req as any).session?.csrfToken;
  
  if (!csrfToken || csrfToken !== sessionCsrf) {
    return res.status(403).json({ error: 'Invalid CSRF token' });
  }
  
  next();
};

/**
 * Generate CSRF token for forms
 */
export const generateCSRFToken = (): string => {
  const { randomBytes } = require('crypto');
  return randomBytes(32).toString('hex');
};