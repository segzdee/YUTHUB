import { Express } from 'express';
import { storage } from './storage';
import { jwtService } from './services/jwtService';
import bcrypt from 'bcrypt';

export class MultiAuthManager {
  static instance: MultiAuthManager;

  static getInstance(): MultiAuthManager {
    if (!MultiAuthManager.instance) {
      MultiAuthManager.instance = new MultiAuthManager();
    }
    return MultiAuthManager.instance;
  }

  async handleEmailLogin(email: string, password: string) {
    try {
      // Find user by email
      const users = await storage.getAllUsers();
      const user = users.find(u => u.email === email);

      if (!user) {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }

      // Always verify password properly - no development bypass
      if (!user.passwordHash) {
        return {
          success: false,
          error: 'Account not properly configured',
        };
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return {
          success: false,
          error: 'Invalid credentials',
        };
      }

      // Update last login
      await storage.upsertUser({
        ...user,
        lastLogin: new Date(),
      });

      // Generate proper JWT tokens
      const { accessToken, refreshToken } = jwtService.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
        tenantId: user.tenantId,
      });

      return {
        success: true,
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Login failed',
      };
    }
  }

  async registerUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    subscriptionTier?: string;
  }) {
    try {
      // Check if user already exists
      const existingUsers = await storage.getAllUsers();
      if (existingUsers.find(u => u.email === userData.email)) {
        return {
          success: false,
          error: 'Email already registered',
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create new user
      const user = await storage.upsertUser({
        id: `user-${Date.now()}`,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash: hashedPassword,
        role: 'user',
        subscriptionTier: userData.subscriptionTier || 'trial',
        subscriptionStatus: 'active',
        maxResidents: 25,
        mfaEnabled: false,
        lastLogin: new Date(),
      });

      // Generate proper JWT tokens
      const { accessToken, refreshToken } = jwtService.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
        tenantId: user.tenantId,
      });

      return {
        success: true,
        user,
        accessToken,
        refreshToken,
        needsEmailVerification: true,
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Registration failed',
      };
    }
  }

  async handleOAuthLogin(params: any) {
    try {
      // Process OAuth response and get/create user
      const user = await this.processOAuthUser(params);
      
      if (!user) {
        return {
          success: false,
          error: 'OAuth authentication failed',
        };
      }

      // Generate proper JWT tokens
      const { accessToken, refreshToken } = jwtService.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
        tenantId: user.tenantId,
      });

      return {
        success: true,
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('OAuth login error:', error);
      return {
        success: false,
        error: 'OAuth authentication failed',
      };
    }
  }

  async handleMicrosoftCallback(code: string, state: string) {
    try {
      // Process Microsoft OAuth callback
      const user = await this.processMicrosoftUser(code, state);
      
      if (!user) {
        return {
          success: false,
          error: 'Microsoft authentication failed',
        };
      }

      // Generate proper JWT tokens
      const { accessToken, refreshToken } = jwtService.generateTokenPair({
        userId: user.id,
        email: user.email,
        role: user.role || 'user',
        tenantId: user.tenantId,
      });

      return {
        success: true,
        user,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error('Microsoft OAuth error:', error);
      return {
        success: false,
        error: 'Microsoft authentication failed',
      };
    }
  }

  private async processOAuthUser(params: any): Promise<any> {
    // Implementation would process OAuth response
    // For now, return a mock user in development
    if (process.env.NODE_ENV === 'development') {
      return await storage.upsertUser({
        id: `oauth-${Date.now()}`,
        email: params.email || 'oauth@example.com',
        firstName: params.firstName || 'OAuth',
        lastName: params.lastName || 'User',
        role: 'user',
        subscriptionTier: 'trial',
        subscriptionStatus: 'active',
        maxResidents: 25,
        mfaEnabled: false,
        lastLogin: new Date(),
      });
    }
    return null;
  }

  private async processMicrosoftUser(code: string, state: string): Promise<any> {
    // Implementation would exchange code for tokens and get user info
    // For now, return a mock user in development
    if (process.env.NODE_ENV === 'development') {
      return await storage.upsertUser({
        id: `microsoft-${Date.now()}`,
        email: 'microsoft@example.com',
        firstName: 'Microsoft',
        lastName: 'User',
        role: 'user',
        subscriptionTier: 'trial',
        subscriptionStatus: 'active',
        maxResidents: 25,
        mfaEnabled: false,
        lastLogin: new Date(),
      });
    }
    return null;
  }

  async getUserAuthMethods(userId: string) {
    return [];
  }

  async removeAuthMethod(userId: string, methodId: number) {
    return true;
  }
}

export const multiAuthManager = MultiAuthManager.getInstance();

export async function setupMultiAuth(app: Express) {
  // Multi-auth setup would go here
  console.log('Multi-auth system initialized');
}
