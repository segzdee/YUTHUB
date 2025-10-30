import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import dotenv from 'dotenv';
import { db } from '../db';

dotenv.config();

export interface EnhancedTokenPayload {
  userId: string;
  email: string;
  role: string;
  primaryOrganizationId: number;
  organizationName: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  features: Record<string, boolean>;
  organizations: Array<{
    organizationId: number;
    organizationName: string;
    role: string;
    isPrimary: boolean;
  }>;
  tenantId?: string;
  sessionId?: string;
}

class EnhancedJWTService {
  private accessTokenSecret: string;
  private refreshTokenSecret: string;
  private accessTokenExpiry: string;
  private refreshTokenExpiry: string;
  private issuer: string;
  private audience: string;

  constructor() {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    if (!process.env.JWT_REFRESH_SECRET) {
      throw new Error('JWT_REFRESH_SECRET environment variable is required');
    }

    this.accessTokenSecret = process.env.JWT_SECRET;
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET;
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m';
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    this.issuer = process.env.JWT_ISSUER || 'yuthub.com';
    this.audience = process.env.JWT_AUDIENCE || 'yuthub-api';
  }

  async loadTenantContext(userId: string): Promise<EnhancedTokenPayload | null> {
    try {
      const userOrgResults = await db.execute(
        `SELECT 
          uo.organization_id,
          uo.role,
          uo.is_primary,
          o.name as organization_name,
          o.subscription_tier,
          o.subscription_status,
          o.features_enabled
        FROM user_organizations uo
        JOIN organizations o ON o.id = uo.organization_id
        WHERE uo.user_id = $1 AND uo.status = 'active' AND uo.is_active = true
        ORDER BY uo.is_primary DESC, uo.created_at ASC`,
        [userId]
      );

      const userOrganizationsData = userOrgResults.rows || [];

      if (userOrganizationsData.length === 0) {
        console.warn(`No active organizations found for user ${userId}`);
        return null;
      }

      const primaryOrg = userOrganizationsData[0] as any;

      const userResults = await db.execute(
        `SELECT email FROM users WHERE id = $1`,
        [userId]
      );

      const userEmail = (userResults.rows?.[0] as any)?.email || '';

      return {
        userId,
        email: userEmail,
        role: primaryOrg.role,
        primaryOrganizationId: primaryOrg.organization_id,
        organizationName: primaryOrg.organization_name,
        subscriptionTier: primaryOrg.subscription_tier,
        subscriptionStatus: primaryOrg.subscription_status,
        features: primaryOrg.features_enabled || {},
        organizations: userOrganizationsData.map((org: any) => ({
          organizationId: org.organization_id,
          organizationName: org.organization_name,
          role: org.role,
          isPrimary: org.is_primary,
        })),
        tenantId: primaryOrg.organization_id.toString(),
      };
    } catch (error) {
      console.error(`Failed to load tenant context for user ${userId}:`, error);
      return null;
    }
  }

  generateAccessToken(payload: EnhancedTokenPayload): string {
    return jwt.sign(payload, this.accessTokenSecret, {
      expiresIn: this.accessTokenExpiry,
      issuer: this.issuer,
      audience: this.audience,
      subject: payload.userId,
      jwtid: randomBytes(16).toString('hex'),
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign(
      { userId, type: 'refresh' },
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        issuer: this.issuer,
        audience: this.audience,
        subject: userId,
        jwtid: randomBytes(16).toString('hex'),
      }
    );
  }

  async generateTokenPairWithContext(userId: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = await this.loadTenantContext(userId);

    if (!payload) {
      throw new Error(
        `Failed to load tenant context for user ${userId}. User may not have any active organizations.`
      );
    }

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(userId),
    };
  }

  generateTokenPair(payload: any): { accessToken: string; refreshToken: string } {
    console.warn(
      'WARNING: generateTokenPair() called without tenant context. Use generateTokenPairWithContext() instead.'
    );
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload.userId),
    };
  }

  verifyAccessToken(token: string): EnhancedTokenPayload {
    try {
      const decoded = jwt.verify(token, this.accessTokenSecret, {
        issuer: this.issuer,
        audience: this.audience,
      }) as any;

      return {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        primaryOrganizationId: decoded.primaryOrganizationId,
        organizationName: decoded.organizationName,
        subscriptionTier: decoded.subscriptionTier,
        subscriptionStatus: decoded.subscriptionStatus,
        features: decoded.features,
        organizations: decoded.organizations,
        tenantId: decoded.tenantId,
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

  verifyRefreshToken(token: string): { userId: string } {
    try {
      const decoded = jwt.verify(token, this.refreshTokenSecret, {
        issuer: this.issuer,
        audience: this.audience,
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

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { userId } = this.verifyRefreshToken(refreshToken);
    return this.generateTokenPairWithContext(userId);
  }

  decodeToken(token: string): any {
    return jwt.decode(token);
  }

  generateSecureToken(): string {
    return randomBytes(32).toString('hex');
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}

export const enhancedJwtService = new EnhancedJWTService();
export default EnhancedJWTService;
