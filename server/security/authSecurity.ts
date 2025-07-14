import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Password complexity requirements
export const PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
};

// Account lockout configuration
export const LOCKOUT_CONFIG = {
  maxAttempts: 5,
  lockoutDuration: 30 * 60 * 1000, // 30 minutes
  resetAfter: 24 * 60 * 60 * 1000, // 24 hours
};

// Session management configuration
export const SESSION_CONFIG = {
  timeout: 30 * 60 * 1000, // 30 minutes
  maxConcurrentSessions: 3,
  refreshThreshold: 15 * 60 * 1000, // 15 minutes before expiry
};

// Rate limiting configurations
export const createAuthLimiter = () => rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  handler: async (req: Request, res: Response) => {
    // Log brute force attempt
    await storage.createAuditLog({
      userId: req.body.email || 'unknown',
      action: 'BRUTE_FORCE_ATTEMPT',
      resource: 'AUTH',
      details: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      },
      success: false,
      riskLevel: 'high',
    });
    
    res.status(429).json({
      message: 'Too many authentication attempts. Account temporarily locked.',
      retryAfter: 15 * 60, // 15 minutes
    });
  },
});

export const createPasswordResetLimiter = () => rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again later',
});

// Password validation
export class PasswordValidator {
  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
    }
    
    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check against common passwords
    if (PASSWORD_REQUIREMENTS.preventCommonPasswords) {
      const commonPasswords = [
        'password', 'password123', '123456', 'qwerty', 'abc123',
        'password1', 'admin', 'welcome', 'login', 'user'
      ];
      
      if (commonPasswords.includes(password.toLowerCase())) {
        errors.push('Password cannot be a commonly used password');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  static async hash(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }
  
  static async verify(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}

// Multi-Factor Authentication
export class MFAManager {
  static generateSecret(userEmail: string): { secret: string; qrCodeUrl: string } {
    const secret = speakeasy.generateSecret({
      name: `YUTHUB (${userEmail})`,
      issuer: 'YUTHUB Youth Housing Management',
      length: 32,
    });
    
    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url!,
    };
  }
  
  static async generateQRCode(otpauthUrl: string): Promise<string> {
    return await QRCode.toDataURL(otpauthUrl);
  }
  
  static verifyToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1, // Allow 1 time step tolerance
    });
  }
}

// Account lockout management
export class AccountLockoutManager {
  static async recordFailedAttempt(userId: string, ip: string): Promise<void> {
    const lockoutData = await storage.getUserLockoutData(userId);
    const now = Date.now();
    
    // Reset attempts if lockout period expired
    if (lockoutData.lockedUntil && now > lockoutData.lockedUntil) {
      await storage.resetUserLockout(userId);
      return;
    }
    
    const newAttempts = lockoutData.failedAttempts + 1;
    const shouldLock = newAttempts >= LOCKOUT_CONFIG.maxAttempts;
    
    await storage.updateUserLockout(userId, {
      failedAttempts: newAttempts,
      lockedUntil: shouldLock ? now + LOCKOUT_CONFIG.lockoutDuration : null,
      lastAttempt: now,
    });
    
    // Log lockout event
    if (shouldLock) {
      await storage.createAuditLog({
        userId,
        action: 'ACCOUNT_LOCKED',
        resource: 'AUTH',
        details: {
          attempts: newAttempts,
          ip,
          lockoutDuration: LOCKOUT_CONFIG.lockoutDuration,
        },
        success: false,
        riskLevel: 'high',
      });
    }
  }
  
  static async isAccountLocked(userId: string): Promise<boolean> {
    const lockoutData = await storage.getUserLockoutData(userId);
    
    if (!lockoutData.lockedUntil) return false;
    
    if (Date.now() > lockoutData.lockedUntil) {
      await storage.resetUserLockout(userId);
      return false;
    }
    
    return true;
  }
  
  static async resetFailedAttempts(userId: string): Promise<void> {
    await storage.resetUserLockout(userId);
  }
}

// Session management
export class SessionManager {
  static async validateSession(sessionId: string, userId: string): Promise<boolean> {
    const session = await storage.getSession(sessionId);
    
    if (!session || session.userId !== userId) {
      return false;
    }
    
    // Check session timeout
    if (Date.now() - session.lastActivity > SESSION_CONFIG.timeout) {
      await storage.deleteSession(sessionId);
      return false;
    }
    
    // Update last activity
    await storage.updateSessionActivity(sessionId);
    return true;
  }
  
  static async createSession(userId: string, deviceInfo: any): Promise<string> {
    // Check concurrent session limit
    const activeSessions = await storage.getUserActiveSessions(userId);
    
    if (activeSessions.length >= SESSION_CONFIG.maxConcurrentSessions) {
      // Remove oldest session
      const oldestSession = activeSessions.sort((a, b) => 
        new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime()
      )[0];
      
      await storage.deleteSession(oldestSession.id);
    }
    
    return await storage.createSession({
      userId,
      deviceInfo,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    });
  }
  
  static async terminateSession(sessionId: string): Promise<void> {
    await storage.deleteSession(sessionId);
  }
  
  static async terminateAllUserSessions(userId: string): Promise<void> {
    await storage.deleteAllUserSessions(userId);
  }
}

// Audit logging
export class AuditLogger {
  static async logAuthAttempt(userId: string, success: boolean, details: any): Promise<void> {
    await storage.createAuditLog({
      userId,
      action: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      resource: 'AUTH',
      details,
      success,
      riskLevel: success ? 'low' : 'medium',
    });
  }
  
  static async logPasswordChange(userId: string, details: any): Promise<void> {
    await storage.createAuditLog({
      userId,
      action: 'PASSWORD_CHANGED',
      resource: 'AUTH',
      details,
      success: true,
      riskLevel: 'medium',
    });
  }
  
  static async logMFASetup(userId: string, enabled: boolean): Promise<void> {
    await storage.createAuditLog({
      userId,
      action: enabled ? 'MFA_ENABLED' : 'MFA_DISABLED',
      resource: 'AUTH',
      details: { timestamp: new Date().toISOString() },
      success: true,
      riskLevel: 'medium',
    });
  }
  
  static async logPermissionChange(userId: string, targetUserId: string, oldRole: string, newRole: string): Promise<void> {
    await storage.createAuditLog({
      userId,
      action: 'PERMISSION_CHANGED',
      resource: 'RBAC',
      details: {
        targetUserId,
        oldRole,
        newRole,
        timestamp: new Date().toISOString(),
      },
      success: true,
      riskLevel: 'high',
    });
  }
}

// JWT token management (for API access)
export class JWTManager {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly ACCESS_TOKEN_EXPIRY = '15m';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';
  
  static generateTokens(userId: string, role: string): { accessToken: string; refreshToken: string } {
    const jwt = require('jsonwebtoken');
    
    const accessToken = jwt.sign(
      { userId, role, type: 'access' },
      this.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );
    
    const refreshToken = jwt.sign(
      { userId, type: 'refresh' },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );
    
    return { accessToken, refreshToken };
  }
  
  static verifyAccessToken(token: string): { userId: string; role: string } | null {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, this.JWT_SECRET);
      
      if (decoded.type !== 'access') {
        return null;
      }
      
      return { userId: decoded.userId, role: decoded.role };
    } catch (error) {
      return null;
    }
  }
  
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(refreshToken, this.JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        return null;
      }
      
      const user = await storage.getUser(decoded.userId);
      if (!user) {
        return null;
      }
      
      return this.generateTokens(user.id, user.role);
    } catch (error) {
      return null;
    }
  }
}