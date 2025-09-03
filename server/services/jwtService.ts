import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  sessionId?: string;
}

interface JWTConfig {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
  issuer: string;
  audience: string;
}

class JWTService {
  private config: JWTConfig;

  constructor() {
    // Validate required environment variables
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }

    // In production, ensure secrets are strong
    if (process.env.NODE_ENV === 'production') {
      if (process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters in production');
      }
      if (process.env.JWT_REFRESH_SECRET.length < 32) {
        throw new Error('JWT_REFRESH_SECRET must be at least 32 characters in production');
      }
    }

    this.config = {
      accessTokenSecret: process.env.JWT_SECRET,
      refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
      accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
      refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
      issuer: process.env.JWT_ISSUER || 'yuthub.com',
      audience: process.env.JWT_AUDIENCE || 'yuthub-api'
    };
  }

  /**
   * Generate access token
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, this.config.accessTokenSecret, {
      expiresIn: this.config.accessTokenExpiry,
      issuer: this.config.issuer,
      audience: this.config.audience,
      subject: payload.userId,
      jwtid: randomBytes(16).toString('hex')
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.config.refreshTokenSecret,
      {
        expiresIn: this.config.refreshTokenExpiry,
        issuer: this.config.issuer,
        audience: this.config.audience,
        subject: userId,
        jwtid: randomBytes(16).toString('hex')
      }
    );
  }

  /**
   * Generate both access and refresh tokens
   */
  generateTokenPair(payload: TokenPayload): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload.userId)
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.config.accessTokenSecret, {
        issuer: this.config.issuer,
        audience: this.config.audience
      }) as any;

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        tenantId: decoded.tenantId,
        sessionId: decoded.sessionId
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid access token');
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.config.refreshTokenSecret, {
        issuer: this.config.issuer,
        audience: this.config.audience
      }) as any;

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return { userId: decoded.userId };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string, getUserData: (userId: string) => Promise<any>): Promise<{ accessToken: string; refreshToken: string }> {
    const { userId } = this.verifyRefreshToken(refreshToken);
    
    // Get fresh user data
    const userData = await getUserData(userId);
    
    if (!userData) {
      throw new Error('User not found');
    }

    // Generate new token pair
    return this.generateTokenPair({
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      tenantId: userData.tenantId,
      sessionId: userData.sessionId
    });
  }

  /**
   * Decode token without verification (for debugging only)
   */
  decodeToken(token: string): any {
    return jwt.decode(token);
  }

  /**
   * Generate a secure random token for email verification, password reset, etc.
   */
  generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  /**
   * Generate a short OTP code for 2FA
   */
  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

// Export singleton instance
export const jwtService = new JWTService();

// Export for testing
export default JWTService;