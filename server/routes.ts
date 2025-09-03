import {
  auditLogs,
  users,
  properties,
  residents,
  incidents,
  organizationInvitations,
  insertAssessmentFormSchema,
  insertFinancialRecordSchema,
  insertGovernmentClientSchema,
  insertIncidentSchema,
  insertMaintenanceRequestSchema,
  insertPropertyRoomSchema,
  insertPropertySchema,
  insertResidentSchema,
  insertStaffMemberSchema,
  insertSupportPlanSchema,
  insertTenancyAgreementSchema,
} from '@shared/schema';
import type { ApiResponse, User } from '@shared/types';
import crypto from 'crypto';
import { and, desc, eq, sql } from 'drizzle-orm';
import type { Express, Request, Response } from 'express';
import { createServer, type Server } from 'http';
import { checkDatabaseHealth, db, getPoolStats, monitorPoolHealth } from './db';
import {
  healthCheck,
  livenessCheck,
  readinessCheck,
} from './middleware/healthCheck';
import { validateInput } from './middleware/inputSanitization';
import { createAccountLimiter } from './middleware/rateLimiter';
import { multiAuthManager, setupMultiAuth } from './multiAuth';
import {
  checkPlatformAdminAuth,
  exportAggregatedData,
  getBillingOversight,
  getFeatureFlags,
  getHistoricalTrends,
  getOrganizationBreakdowns,
  getPlatformAnalytics,
  getPlatformOrganizations,
  getPlatformOverview,
  getPlatformSubscriptions,
  getRealTimeDashboardMetrics,
  getSystemMonitoring,
  handleEmergencyAction,
  validateDataConsistency,
} from './platformAdmin';
import { enhancedPlatformAdminAuth } from './platformAdminValidation';
import { isAuthenticated, requireAuth, setupAuth } from './replitAuth';
import fileManagementRoutes from './routes/fileManagement';
import monitoringRoutes from './routes/monitoring';
import {
  AuditLogger,
  createAuthLimiter,
  createPasswordResetLimiter,
  MFAManager,
} from './security/authSecurity';
import {
  filterDataByRole,
  PERMISSIONS,
  requirePermission,
} from './security/rbacMiddleware';
import { emailService } from './services/emailService.js';
import { storage } from './storage';

interface AuthenticatedRequest extends Request {
  user?: {
    claims?: {
      sub: string;
    };
  };
}

export async function registerRoutes(
  app: Express,
  server?: Server
): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  await setupMultiAuth(app);

  // Health check endpoints
  app.get('/health', healthCheck);
  app.get('/health/ready', readinessCheck);
  app.get('/health/live', livenessCheck);

  // Connection pool monitoring endpoints
  app.get('/api/monitoring/pool-stats', async (req, res) => {
    try {
      const stats = getPoolStats();
      const health = await checkDatabaseHealth();

      res.json({
        ...stats,
        databaseHealth: health,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching pool stats:', error);
      res.status(500).json({ message: 'Failed to fetch pool stats' });
    }
  });

  app.get('/api/monitoring/compute-health', async (req, res) => {
    try {
      const poolStats = monitorPoolHealth();
      const dbHealth = await checkDatabaseHealth();

      res.json({
        compute: {
          processId: process.pid,
          uptime: process.uptime(),
          memoryUsage: process.memoryUsage(),
          cpuUsage: process.cpuUsage(),
          version: process.version,
          platform: process.platform,
          arch: process.arch,
        },
        database: {
          ...poolStats,
          healthy: dbHealth,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error fetching compute health:', error);
      res.status(500).json({ message: 'Failed to fetch compute health' });
    }
  });

  // Apply security middleware
  app.use('/api/auth/login', createAuthLimiter());
  app.use('/api/auth/password-reset', createPasswordResetLimiter());
  app.use(filterDataByRole);

  // File management routes
  app.use('/api/files', fileManagementRoutes);

  // Monitoring routes (system optimization)
  app.use('/api/monitoring', monitoringRoutes);

  // Auth routes with proper typing
  app.get(
    '/api/auth/user',
    isAuthenticated,
    async (req: AuthenticatedRequest, res: Response<ApiResponse<User>>) => {
      try {
        const userId = req.user?.claims?.sub;
        if (!userId) {
          return res.status(401).json({
            success: false,
            error: 'User not authenticated',
          });
        }

        const user = await storage.getUser(userId);

        if (!user) {
          return res.status(404).json({
            success: false,
            error: 'User not found',
          });
        }

        // Log successful user data access
        await AuditLogger.logAuthAttempt(userId, true, {
          action: 'USER_DATA_ACCESS',
          ip: req.ip || 'unknown',
          userAgent: req.get('User-Agent') || 'unknown',
        });

        res.json({
          success: true,
          data: user,
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
          success: false,
          error: 'Internal server error',
        });
      }
    }
  );

  // Multi-auth endpoints
  app.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
      const result = await multiAuthManager.handleEmailLogin(email, password);

      if (result.success) {
        res.json({
          success: true,
          user: result.user,
          token: result.token,
        });
      } else {
        res.status(401).json({
          success: false,
          error: result.error || 'Invalid credentials',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
      });
    }
  });

  app.post('/auth/register', createAccountLimiter, async (req, res) => {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        tosAccepted,
        organizationId,
      } = req.body;

      if (!tosAccepted) {
        return res
          .status(400)
          .json({ error: 'You must accept the Terms of Service to register' });
      }

      const verificationToken = crypto.randomBytes(32).toString('hex');

      const newUser = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          firstName,
          lastName,
          tosAccepted: true,
          tosAcceptedAt: new Date(),
          emailVerificationToken: verificationToken,
          organizationId,
        })
        .returning();

      await emailService.sendVerificationEmail(
        email,
        verificationToken,
        firstName || email
      );

      res.status(201).json({
        message:
          'Registration successful. Please check your email to verify your account.',
        userId: newUser[0].id,
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
      });
    }
  });

  // OAuth callback endpoints
  app.get('/auth/google/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      const result = await multiAuthManager.handleOAuthLogin({
        provider: 'GOOGLE',
        code: code as string,
        state: state as string,
      });

      if (result.success) {
        res.redirect('/dashboard');
      } else {
        res.redirect('/login?error=oauth_failed');
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      res.redirect('/login?error=oauth_failed');
    }
  });

  app.get('/auth/microsoft/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      const result = await multiAuthManager.handleMicrosoftCallback(
        code as string,
        state as string
      );

      if (result.success) {
        res.redirect('/dashboard');
      } else {
        res.redirect('/login?error=oauth_failed');
      }
    } catch (error) {
      console.error('Microsoft OAuth error:', error);
      res.redirect('/login?error=oauth_failed');
    }
  });

  // Auth methods management
  app.get('/api/auth/methods', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      const methods = await multiAuthManager.getUserAuthMethods(userId);
      res.json(methods);
    } catch (error) {
      console.error('Error fetching auth methods:', error);
      res.status(500).json({ message: 'Failed to fetch auth methods' });
    }
  });

  app.delete(
    '/api/auth/methods/:methodId',
    isAuthenticated,
    async (req: any, res) => {
      try {
        const userId = req.user?.claims?.sub;
        if (!userId) {
          return res.status(401).json({ message: 'Unauthorized' });
        }
        const methodId = parseInt(req.params.methodId);

        await multiAuthManager.removeAuthMethod(userId, methodId);
        res.json({ success: true });
      } catch (error) {
        console.error('Error removing auth method:', error);
        res.status(500).json({ message: 'Failed to remove auth method' });
      }
    }
  );

  // Security endpoints
  app.post('/api/auth/setup-mfa', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { secret, qrCodeUrl } = MFAManager.generateSecret(user.email || '');
      const qrCode = await MFAManager.generateQRCode(qrCodeUrl);

      // Update user with MFA secret (not yet enabled)
      await storage.upsertUser({
        ...user,
        mfaSecret: secret,
      });

      await AuditLogger.logMFASetup(userId, false); // Setup initiated, not enabled

      res.json({
        secret,
        qrCode,
        message:
          'MFA setup initiated. Please verify with a token to complete setup.',
      });
    } catch (error) {
      console.error('Error setting up MFA:', error);
      res.status(500).json({ message: 'Failed to setup MFA' });
    }
  });

  app.post('/api/auth/verify-mfa', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ message: 'Token required' });
      }

      const user = await storage.getUser(userId);
      if (!user || !user.mfaSecret) {
        return res.status(400).json({ message: 'MFA not setup' });
      }

      const isValid = MFAManager.verifyToken(token, user.mfaSecret);

      if (!isValid) {
        await AuditLogger.logAuthAttempt(userId, false, {
          action: 'MFA_VERIFICATION_FAILED',
          ip: req.ip,
          userAgent: req.get('User-Agent'),
        });

        return res.status(400).json({ message: 'Invalid token' });
      }

      // Enable MFA for user
      await storage.upsertUser({
        ...user,
        mfaEnabled: true,
      });

      await AuditLogger.logMFASetup(userId, true);

      res.json({ message: 'MFA enabled successfully' });
    } catch (error) {
      console.error('Error verifying MFA:', error);
      res.status(500).json({ message: 'Failed to verify MFA' });
    }
  });

  app.post('/api/auth/disable-mfa', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      await storage.upsertUser({
        ...user,
        mfaEnabled: false,
        mfaSecret: null,
      });

      await AuditLogger.logMFASetup(userId, false);

      res.json({ message: 'MFA disabled successfully' });
    } catch (error) {
      console.error('Error disabling MFA:', error);
      res.status(500).json({ message: 'Failed to disable MFA' });
    }
  });

  // Audit log endpoint (admin only)
  app.get(
    '/api/audit-logs',
    isAuthenticated,
    requirePermission(PERMISSIONS.AUDIT_READ),
    async (req: any, res) => {
      try {
        const { page = 1, limit = 50, userId, action, resource } = req.query;

        // This would need to be implemented in storage
        const logs = await db
          .select()
          .from(auditLogs)
          .where(
            and(
              userId ? eq(auditLogs.userId, userId) : sql`TRUE`,
              action ? eq(auditLogs.action, action) : sql`TRUE`,
              resource ? eq(auditLogs.resource, resource) : sql`TRUE`
            )
          )
          .orderBy(desc(auditLogs.timestamp))
          .limit(parseInt(limit))
          .offset((parseInt(page) - 1) * parseInt(limit));

        res.json(logs);
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ message: 'Failed to fetch audit logs' });
      }
    }
  );

  // Security metrics endpoint
  app.post('/auth/verify-email', async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res
          .status(400)
          .json({ error: 'Verification token is required' });
      }

      const user = await db
        .select()
        .from(users)
        .where(eq(users.emailVerificationToken, token))
        .limit(1);

      if (user.length === 0) {
        return res
          .status(400)
          .json({ error: 'Invalid or expired verification token' });
      }

      await db
        .update(users)
        .set({
          emailVerified: true,
          emailVerificationToken: null,
        })
        .where(eq(users.id, user[0].id));

      await emailService.sendWelcomeEmail(
        user[0].email,
        user[0].firstName || user[0].email
      );

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post(
    '/auth/forgot-password',
    createPasswordResetLimiter,
    async (req, res) => {
      try {
        const { email } = req.body;

        if (!email) {
          return res.status(400).json({ error: 'Email is required' });
        }

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (user.length === 0) {
          return res.json({
            message:
              'If an account with that email exists, a password reset link has been sent.',
          });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpires = new Date(Date.now() + 3600000); // 1 hour

        await db
          .update(users)
          .set({
            passwordResetToken: resetToken,
            passwordResetExpires: resetExpires,
          })
          .where(eq(users.id, user[0].id));

        await emailService.sendPasswordResetEmail(
          user[0].email,
          resetToken,
          user[0].firstName || user[0].email
        );

        res.json({
          message:
            'If an account with that email exists, a password reset link has been sent.',
        });
      } catch (error) {
        console.error('Password reset request error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  app.post('/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ error: 'Token and new password are required' });
      }

      if (newPassword.length < 8) {
        return res
          .status(400)
          .json({ error: 'Password must be at least 8 characters long' });
      }

      const user = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.passwordResetToken, token),
            gt(users.passwordResetExpires, new Date())
          )
        )
        .limit(1);

      if (user.length === 0) {
        return res
          .status(400)
          .json({ error: 'Invalid or expired reset token' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await db
        .update(users)
        .set({
          password: hashedPassword,
          passwordResetToken: null,
          passwordResetExpires: null,
          failedLoginAttempts: 0,
          lockedUntil: null,
        })
        .where(eq(users.id, user[0].id));

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/admin/invite-user', requireAuth, async (req, res) => {
    try {
      const { email, organizationId, role = 'member' } = req.body;
      const inviterUserId = req.user.id;

      const inviter = await db
        .select()
        .from(users)
        .where(
          and(
            eq(users.id, inviterUserId),
            eq(users.organizationId, organizationId),
            eq(users.role, 'admin')
          )
        )
        .limit(1);

      if (inviter.length === 0) {
        return res
          .status(403)
          .json({ error: 'Insufficient permissions to send invitations' });
      }

      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser.length > 0) {
        return res
          .status(400)
          .json({ error: 'User with this email already exists' });
      }

      const existingInvite = await db
        .select()
        .from(organizationInvitations)
        .where(
          and(
            eq(organizationInvitations.email, email),
            eq(organizationInvitations.organizationId, organizationId),
            eq(organizationInvitations.status, 'pending')
          )
        )
        .limit(1);

      if (existingInvite.length > 0) {
        return res
          .status(400)
          .json({ error: 'Invitation already sent to this email' });
      }

      const inviteToken = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      await db.insert(organizationInvitations).values({
        organizationId,
        email,
        inviterUserId,
        token: inviteToken,
        role,
        expiresAt,
      });

      const organization = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, organizationId))
        .limit(1);

      await emailService.sendOrganizationInvitation(
        email,
        organization[0]?.name || 'YUTHUB Organization',
        `${inviter[0].firstName} ${inviter[0].lastName}`,
        inviteToken
      );

      res.json({ message: 'Invitation sent successfully' });
    } catch (error) {
      console.error('Invitation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/auth/accept-invitation', async (req, res) => {
    try {
      const { token, password, firstName, lastName } = req.body;

      if (!token || !password || !firstName || !lastName) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const invitation = await db
        .select()
        .from(organizationInvitations)
        .where(
          and(
            eq(organizationInvitations.token, token),
            eq(organizationInvitations.status, 'pending'),
            gt(organizationInvitations.expiresAt, new Date())
          )
        )
        .limit(1);

      if (invitation.length === 0) {
        return res.status(400).json({ error: 'Invalid or expired invitation' });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const newUser = await db
        .insert(users)
        .values({
          email: invitation[0].email,
          password: hashedPassword,
          firstName,
          lastName,
          organizationId: invitation[0].organizationId,
          role: invitation[0].role,
          emailVerified: true,
          tosAccepted: true,
          tosAcceptedAt: new Date(),
        })
        .returning();

      await db
        .update(organizationInvitations)
        .set({
          status: 'accepted',
          acceptedAt: new Date(),
        })
        .where(eq(organizationInvitations.id, invitation[0].id));

      const organization = await db
        .select()
        .from(organizations)
        .where(eq(organizations.id, invitation[0].organizationId))
        .limit(1);

      await emailService.sendWelcomeEmail(
        invitation[0].email,
        firstName,
        organization[0]?.name
      );

      res.json({
        message: 'Account created successfully',
        userId: newUser[0].id,
      });
    } catch (error) {
      console.error('Accept invitation error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get(
    '/api/security/metrics',
    isAuthenticated,
    requirePermission(PERMISSIONS.SECURITY_READ),
    async (req: any, res) => {
      try {
        const { timeRange = '24h' } = req.query;
        const timeRangeMs =
          timeRange === '1h'
            ? 3600000
            : timeRange === '24h'
              ? 86400000
              : timeRange === '7d'
                ? 604800000
                : 2592000000; // 30d

        const since = new Date(Date.now() - timeRangeMs);

        // Get security metrics from audit logs
        const totalLogins = await db
          .select({ count: sql<number>`count(*)` })
          .from(auditLogs)
          .where(
            and(
              eq(auditLogs.action, 'LOGIN'),
              sql`${auditLogs.timestamp} >= ${since}`
            )
          );

        const failedLogins = await db
          .select({ count: sql<number>`count(*)` })
          .from(auditLogs)
          .where(
            and(
              eq(auditLogs.action, 'LOGIN'),
              eq(auditLogs.success, false),
              sql`${auditLogs.timestamp} >= ${since}`
            )
          );

        const highRiskEvents = await db
          .select({ count: sql<number>`count(*)` })
          .from(auditLogs)
          .where(
            and(
              eq(auditLogs.riskLevel, 'high'),
              sql`${auditLogs.timestamp} >= ${since}`
            )
          );

        const metrics = {
          totalLogins: totalLogins[0]?.count || 0,
          failedLogins: failedLogins[0]?.count || 0,
          mfaEnabled: 0, // This would need to be calculated from users table
          activeSessions: 0, // This would need to be calculated from sessions table
          highRiskEvents: highRiskEvents[0]?.count || 0,
          lastIncident: 'None',
          passwordStrength: 85,
          accountLockouts: 0,
        };

        res.json(metrics);
      } catch (error) {
        console.error('Error fetching security metrics:', error);
        res.status(500).json({ message: 'Failed to fetch security metrics' });
      }
    }
  );

  // Security events endpoint
  app.get(
    '/api/security/events',
    isAuthenticated,
    requirePermission(PERMISSIONS.SECURITY_READ),
    async (req: any, res) => {
      try {
        const { timeRange = '24h' } = req.query;
        const timeRangeMs =
          timeRange === '1h'
            ? 3600000
            : timeRange === '24h'
              ? 86400000
              : timeRange === '7d'
                ? 604800000
                : 2592000000; // 30d

        const since = new Date(Date.now() - timeRangeMs);

        const events = await db
          .select()
          .from(auditLogs)
          .where(sql`${auditLogs.timestamp} >= ${since}`)
          .orderBy(desc(auditLogs.timestamp))
          .limit(50);

        const formattedEvents = events.map(event => ({
          id: event.id,
          timestamp: event.timestamp,
          type: event.action,
          description: `${event.action} on ${event.resource}`,
          riskLevel: event.riskLevel,
          status: event.success ? 'resolved' : 'open',
          userId: event.userId,
          ipAddress: event.ipAddress || 'Unknown',
        }));

        res.json(formattedEvents);
      } catch (error) {
        console.error('Error fetching security events:', error);
        res.status(500).json({ message: 'Failed to fetch security events' });
      }
    }
  );

  // Security alerts endpoint
  app.get(
    '/api/security/alerts',
    isAuthenticated,
    requirePermission(PERMISSIONS.SECURITY_READ),
    async (req: any, res) => {
      try {
        // Mock security alerts - in a real implementation, this would come from a monitoring system
        const alerts = [
          {
            id: '1',
            title: 'Multiple Failed Login Attempts',
            description:
              'Detected 5 failed login attempts from IP 192.168.1.100',
            severity: 'warning',
            timestamp: new Date().toISOString(),
            actions: ['Block IP', 'Notify User', 'Review Logs'],
          },
          {
            id: '2',
            title: 'High Risk Activity Detected',
            description:
              'Unusual access pattern detected for financial records',
            severity: 'error',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            actions: ['Investigate', 'Lock Account', 'Contact Admin'],
          },
        ];

        res.json(alerts);
      } catch (error) {
        console.error('Error fetching security alerts:', error);
        res.status(500).json({ message: 'Failed to fetch security alerts' });
      }
    }
  );

  // Security settings endpoint
  app.get('/api/security/settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const settings = {
        mfaEnabled: user.mfaEnabled || false,
        role: user.role || 'user',
        permissions: ['property_read', 'support_read', 'incident_read'], // This would be calculated based on role
        passwordLastChanged: user.updatedAt,
        lastLogin: user.lastLogin,
      };

      res.json(settings);
    } catch (error) {
      console.error('Error fetching security settings:', error);
      res.status(500).json({ message: 'Failed to fetch security settings' });
    }
  });

  // Active sessions endpoint
  app.get('/api/security/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const sessions = await storage.getUserActiveSessions(userId);

      res.json(sessions);
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      res.status(500).json({ message: 'Failed to fetch active sessions' });
    }
  });

  // Revoke session endpoint
  app.delete(
    '/api/security/sessions/:sessionId',
    isAuthenticated,
    async (req: any, res) => {
      try {
        const { sessionId } = req.params;
        const userId = req.user?.claims?.sub;

        await storage.deleteSession(sessionId);

        await AuditLogger.logResourceAccess(userId, 'session', 'revoke', true, {
          ip: req.ip,
          userAgent: req.get('User-Agent'),
          resourceId: sessionId,
          riskLevel: 'medium',
        });

        res.json({ message: 'Session revoked successfully' });
      } catch (error) {
        console.error('Error revoking session:', error);
        res.status(500).json({ message: 'Failed to revoke session' });
      }
    }
  );

  // Dashboard metrics with proper error handling
  app.get(
    '/api/dashboard/metrics',
    isAuthenticated,
    async (req: Request, res: Response) => {
      try {
        const metrics = await storage.getDashboardMetrics();
        res.json(metrics);
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard metrics' });
      }
    }
  );

  // Properties routes
  app.get(
    '/api/properties',
    isAuthenticated,
    requirePermission(PERMISSIONS.PROPERTIES_READ),
    async (req: any, res: Response) => {
      try {
        const properties = await storage.getProperties();

        // Log property access
        await AuditLogger.logResourceAccess(
          req.user?.claims?.sub,
          'properties',
          'read',
          true,
          {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            resultCount: properties.length,
          }
        );

        res.json(properties);
      } catch (error) {
        console.error('Error fetching properties:', error);
        res.status(500).json({ message: 'Failed to fetch properties' });
      }
    }
  );

  app.post(
    '/api/properties',
    isAuthenticated,
    validateInput(insertPropertySchema),
    async (req, res) => {
      try {
        const propertyData = insertPropertySchema.parse(req.body);
        const property = await storage.createProperty(propertyData);

        // Log activity
        await storage.createActivity({
          userId: (req.user as any)?.claims?.sub,
          activityType: 'property_created',
          title: 'New property added',
          description: `Property "${property.name}" has been added to the system`,
          entityId: property.id,
          entityType: 'property',
        });

        res.status(201).json(property);
      } catch (error) {
        console.error('Error creating property:', error);
        res.status(400).json({ message: 'Failed to create property' });
      }
    }
  );

  app.get('/api/properties/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ message: 'Property not found' });
      }
      res.json(property);
    } catch (error) {
      console.error('Error fetching property:', error);
      res.status(500).json({ message: 'Failed to fetch property' });
    }
  });

  // Residents routes
  app.get('/api/residents', isAuthenticated, async (req, res) => {
    try {
      const residents = await storage.getResidents();
      res.json(residents);
    } catch (error) {
      console.error('Error fetching residents:', error);
      res.status(500).json({ message: 'Failed to fetch residents' });
    }
  });

  app.post(
    '/api/residents',
    isAuthenticated,
    validateInput(insertResidentSchema),
    async (req, res) => {
      try {
        const residentData = insertResidentSchema.parse(req.body);
        const resident = await storage.createResident(residentData);

        // Log activity
        await storage.createActivity({
          userId: (req.user as any)?.claims?.sub,
          activityType: 'placement',
          title: 'New resident placement',
          description: `${resident.firstName} ${resident.lastName} has been placed in the system`,
          entityId: resident.id,
          entityType: 'resident',
        });

        res.status(201).json(resident);
      } catch (error) {
        console.error('Error creating resident:', error);
        res.status(400).json({ message: 'Failed to create resident' });
      }
    }
  );

  app.get('/api/residents/at-risk', isAuthenticated, async (req, res) => {
    try {
      const riskyResidents = await storage.getRiskyResidents();
      res.json(riskyResidents);
    } catch (error) {
      console.error('Error fetching risky residents:', error);
      res.status(500).json({ message: 'Failed to fetch risky residents' });
    }
  });

  // Support Plans routes
  app.get('/api/support-plans', isAuthenticated, async (req, res) => {
    try {
      const plans = await storage.getSupportPlans();
      res.json(plans);
    } catch (error) {
      console.error('Error fetching support plans:', error);
      res.status(500).json({ message: 'Failed to fetch support plans' });
    }
  });

  app.post('/api/support-plans', isAuthenticated, async (req, res) => {
    try {
      const planData = insertSupportPlanSchema.parse(req.body);
      const plan = await storage.createSupportPlan(planData);

      // Log activity
      await storage.createActivity({
        userId: (req.user as any)?.claims?.sub,
        activityType: 'support_plan',
        title: 'Support plan created',
        description: 'New support plan has been created',
        entityId: plan.id,
        entityType: 'support_plan',
      });

      res.status(201).json(plan);
    } catch (error) {
      console.error('Error creating support plan:', error);
      res.status(400).json({ message: 'Failed to create support plan' });
    }
  });

  // Incidents routes
  app.get('/api/incidents', isAuthenticated, async (req, res) => {
    try {
      const incidents = await storage.getIncidents();
      res.json(incidents);
    } catch (error) {
      console.error('Error fetching incidents:', error);
      res.status(500).json({ message: 'Failed to fetch incidents' });
    }
  });

  app.post(
    '/api/incidents',
    isAuthenticated,
    validateInput(insertIncidentSchema),
    async (req, res) => {
      try {
        const incidentData = insertIncidentSchema.parse(req.body);
        const incident = await storage.createIncident({
          ...incidentData,
          reportedBy: (req.user as any)?.claims?.sub,
        });

        // Log activity
        await storage.createActivity({
          userId: (req.user as any)?.claims?.sub,
          activityType: 'incident',
          title: 'Incident reported',
          description: `${incident.title} - ${incident.severity} severity`,
          entityId: incident.id,
          entityType: 'incident',
        });

        res.status(201).json(incident);
      } catch (error) {
        console.error('Error creating incident:', error);
        res.status(400).json({ message: 'Failed to create incident' });
      }
    }
  );

  app.get('/api/incidents/active', isAuthenticated, async (req, res) => {
    try {
      const activeIncidents = await storage.getActiveIncidents();
      res.json(activeIncidents);
    } catch (error) {
      console.error('Error fetching active incidents:', error);
      res.status(500).json({ message: 'Failed to fetch active incidents' });
    }
  });

  // Activities routes
  app.get('/api/activities', isAuthenticated, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ message: 'Failed to fetch activities' });
    }
  });

  // Financial records routes
  app.get(
    '/api/financial-records',
    isAuthenticated,
    requirePermission(PERMISSIONS.FINANCIAL_READ),
    async (req: any, res: Response) => {
      try {
        const records = await storage.getFinancialRecords();

        // High risk audit log for financial data access
        await AuditLogger.logResourceAccess(
          req.user?.claims?.sub,
          'financial-records',
          'read',
          true,
          {
            ip: req.ip,
            userAgent: req.get('User-Agent'),
            resultCount: records.length,
            riskLevel: 'high',
          }
        );

        res.json(records);
      } catch (error) {
        console.error('Error fetching financial records:', error);
        res.status(500).json({ message: 'Failed to fetch financial records' });
      }
    }
  );

  app.post('/api/financial-records', isAuthenticated, async (req, res) => {
    try {
      const recordData = insertFinancialRecordSchema.parse(req.body);
      const record = await storage.createFinancialRecord(recordData);
      res.status(201).json(record);
    } catch (error) {
      console.error('Error creating financial record:', error);
      res.status(400).json({ message: 'Failed to create financial record' });
    }
  });

  // Subscription management endpoints
  app.post('/api/subscriptions/create', isAuthenticated, async (req, res) => {
    try {
      const { tier } = req.body;
      const userId = (req.user as any)?.claims?.sub;

      if (!tier || !['starter', 'professional', 'enterprise'].includes(tier)) {
        return res.status(400).json({ message: 'Invalid subscription tier' });
      }

      // Define tier configurations
      const tierConfigs = {
        starter: { maxResidents: 25, price: 169 },
        professional: { maxResidents: 100, price: 429 },
        enterprise: { maxResidents: 999999, price: 1099 },
      };

      const config = tierConfigs[tier as keyof typeof tierConfigs];

      // Update user subscription
      const user = await storage.updateUserSubscription(userId, {
        tier,
        status: 'active',
        maxResidents: config.maxResidents,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      });

      // Log subscription activity
      await storage.createActivity({
        userId,
        activityType: 'subscription',
        title: 'Subscription created',
        description: `Subscribed to ${tier} plan`,
        entityId: null,
        entityType: 'subscription',
      });

      res.json({
        success: true,
        message: 'Subscription created successfully',
        subscription: {
          tier: user.subscriptionTier,
          status: user.subscriptionStatus,
          maxResidents: user.maxResidents,
          startDate: user.subscriptionStartDate,
          endDate: user.subscriptionEndDate,
        },
      });
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(500).json({ message: 'Failed to create subscription' });
    }
  });

  app.get('/api/subscriptions/current', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({
        tier: user.subscriptionTier || 'trial',
        status: user.subscriptionStatus || 'active',
        maxResidents: user.maxResidents || 25,
        startDate: user.subscriptionStartDate,
        endDate: user.subscriptionEndDate,
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ message: 'Failed to fetch subscription' });
    }
  });

  app.post('/api/subscriptions/cancel', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;

      const user = await storage.updateUserSubscription(userId, {
        tier: 'trial',
        status: 'cancelled',
        maxResidents: 25,
      });

      // Log cancellation activity
      await storage.createActivity({
        userId,
        activityType: 'subscription',
        title: 'Subscription cancelled',
        description: 'Subscription has been cancelled',
        entityId: null,
        entityType: 'subscription',
      });

      res.json({
        success: true,
        message: 'Subscription cancelled successfully',
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(500).json({ message: 'Failed to cancel subscription' });
    }
  });

  // Forms draft endpoints
  app.get('/api/forms/draft/:formType', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const { formType } = req.params;

      // For now, return empty draft - in a full implementation, this would query a drafts table
      res.json({
        formType,
        data: {},
        lastSaved: null,
        message: 'No draft found',
      });
    } catch (error) {
      console.error('Error fetching form draft:', error);
      res.status(404).json({ message: 'Draft not found' });
    }
  });

  app.post('/api/forms/draft/:formType', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const { formType } = req.params;
      const { data } = req.body;

      // For now, just return success - in a full implementation, this would save to a drafts table
      res.json({
        formType,
        data,
        lastSaved: new Date(),
        message: 'Draft saved successfully',
      });
    } catch (error) {
      console.error('Error saving form draft:', error);
      res.status(500).json({ message: 'Failed to save draft' });
    }
  });

  // Crisis Connect endpoint
  app.post('/api/crisis-connect', isAuthenticated, async (req, res) => {
    try {
      const { type, message, location } = req.body;

      // Create high-severity incident for crisis situations
      const incident = await storage.createIncident({
        title: 'Crisis Connect Alert',
        description: message || 'Crisis situation reported via Crisis Connect',
        incidentType: 'safety',
        severity: 'critical',
        status: 'open',
        reportedBy: (req.user as any)?.claims?.sub,
        propertyId: location ? parseInt(location) : undefined,
      });

      // Log crisis activity
      await storage.createActivity({
        userId: (req.user as any)?.claims?.sub,
        activityType: 'crisis',
        title: 'Crisis Connect activated',
        description: `Crisis response initiated: ${type}`,
        entityId: incident.id,
        entityType: 'incident',
      });

      res.json({
        success: true,
        incidentId: incident.id,
        message: 'Crisis response initiated successfully',
      });
    } catch (error) {
      console.error('Error handling crisis connect:', error);
      res.status(500).json({ message: 'Failed to handle crisis connect' });
    }
  });

  // Form drafts endpoints
  app.get('/api/forms/draft/:formType', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const draft = await storage.getFormDraft(userId, req.params.formType);
      if (!draft) {
        return res.status(404).json({ message: 'Draft not found' });
      }
      res.json(draft);
    } catch (error) {
      console.error('Error fetching form draft:', error);
      res.status(500).json({ message: 'Failed to fetch form draft' });
    }
  });

  app.post('/api/forms/draft', isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      const draft = await storage.createFormDraft({
        ...req.body,
        userId,
      });
      res.status(201).json(draft);
    } catch (error) {
      console.error('Error creating form draft:', error);
      res.status(500).json({ message: 'Failed to create form draft' });
    }
  });

  app.patch('/api/forms/draft/:id', isAuthenticated, async (req, res) => {
    try {
      const draft = await storage.updateFormDraft(
        parseInt(req.params.id),
        req.body
      );
      res.json(draft);
    } catch (error) {
      console.error('Error updating form draft:', error);
      res.status(500).json({ message: 'Failed to update form draft' });
    }
  });

  // Assessment forms endpoints
  app.get('/api/assessment-forms', isAuthenticated, async (req, res) => {
    try {
      const forms = await storage.getAssessmentForms();
      res.json(forms);
    } catch (error) {
      console.error('Error fetching assessment forms:', error);
      res.status(500).json({ message: 'Failed to fetch assessment forms' });
    }
  });

  app.post('/api/assessment-forms', isAuthenticated, async (req, res) => {
    try {
      const form = await storage.createAssessmentForm(req.body);
      res.status(201).json(form);
    } catch (error) {
      console.error('Error creating assessment form:', error);
      res.status(500).json({ message: 'Failed to create assessment form' });
    }
  });

  // Progress tracking endpoints
  app.get('/api/progress-tracking', isAuthenticated, async (req, res) => {
    try {
      const residentId = req.query.residentId
        ? parseInt(req.query.residentId as string)
        : undefined;
      const tracking = await storage.getProgressTracking(residentId);
      res.json(tracking);
    } catch (error) {
      console.error('Error fetching progress tracking:', error);
      res.status(500).json({ message: 'Failed to fetch progress tracking' });
    }
  });

  app.post('/api/progress-tracking', isAuthenticated, async (req, res) => {
    try {
      const tracking = await storage.createProgressTracking(req.body);
      res.status(201).json(tracking);
    } catch (error) {
      console.error('Error creating progress tracking:', error);
      res.status(500).json({ message: 'Failed to create progress tracking' });
    }
  });

  // Staff members endpoints
  app.get('/api/staff-members', isAuthenticated, async (req, res) => {
    try {
      const staff = await storage.getStaffMembers();
      res.json(staff);
    } catch (error) {
      console.error('Error fetching staff members:', error);
      res.status(500).json({ message: 'Failed to fetch staff members' });
    }
  });

  app.post('/api/staff-members', isAuthenticated, async (req, res) => {
    try {
      const staff = await storage.createStaffMember(req.body);
      res.status(201).json(staff);
    } catch (error) {
      console.error('Error creating staff member:', error);
      res.status(500).json({ message: 'Failed to create staff member' });
    }
  });

  // Maintenance requests endpoints
  app.get('/api/maintenance-requests', isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getMaintenanceRequests();
      res.json(requests);
    } catch (error) {
      console.error('Error fetching maintenance requests:', error);
      res.status(500).json({ message: 'Failed to fetch maintenance requests' });
    }
  });

  app.post('/api/maintenance-requests', isAuthenticated, async (req, res) => {
    try {
      const request = await storage.createMaintenanceRequest(req.body);
      res.status(201).json(request);
    } catch (error) {
      console.error('Error creating maintenance request:', error);
      res.status(500).json({ message: 'Failed to create maintenance request' });
    }
  });

  // Tenancy agreements endpoints
  app.get('/api/tenancy-agreements', isAuthenticated, async (req, res) => {
    try {
      const agreements = await storage.getTenancyAgreements();
      res.json(agreements);
    } catch (error) {
      console.error('Error fetching tenancy agreements:', error);
      res.status(500).json({ message: 'Failed to fetch tenancy agreements' });
    }
  });

  app.post('/api/tenancy-agreements', isAuthenticated, async (req, res) => {
    try {
      const agreement = await storage.createTenancyAgreement(req.body);
      res.status(201).json(agreement);
    } catch (error) {
      console.error('Error creating tenancy agreement:', error);
      res.status(500).json({ message: 'Failed to create tenancy agreement' });
    }
  });

  // Property rooms endpoints
  app.get(
    '/api/property-rooms/:propertyId',
    isAuthenticated,
    async (req, res) => {
      try {
        const rooms = await storage.getPropertyRooms(
          parseInt(req.params.propertyId)
        );
        res.json(rooms);
      } catch (error) {
        console.error('Error fetching property rooms:', error);
        res.status(500).json({ message: 'Failed to fetch property rooms' });
      }
    }
  );

  app.post('/api/property-rooms', isAuthenticated, async (req, res) => {
    try {
      const room = await storage.createPropertyRoom(req.body);
      res.status(201).json(room);
    } catch (error) {
      console.error('Error creating property room:', error);
      res.status(500).json({ message: 'Failed to create property room' });
    }
  });

  // Dashboard metrics endpoint
  app.get('/api/dashboard/metrics', isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard metrics' });
    }
  });

  // Report generation endpoints
  app.post('/api/reports/generate', isAuthenticated, async (req, res) => {
    try {
      const { type, dateRange, properties, filters } = req.body;

      let reportData;

      switch (type) {
        case 'occupancy':
          reportData = await generateOccupancyReport(
            dateRange,
            properties,
            filters
          );
          break;
        case 'financial':
          reportData = await generateFinancialReport(
            dateRange,
            properties,
            filters
          );
          break;
        case 'incident':
          reportData = await generateIncidentReport(
            dateRange,
            properties,
            filters
          );
          break;
        case 'progress':
          reportData = await generateProgressReport(
            dateRange,
            properties,
            filters
          );
          break;
        case 'compliance':
          reportData = await generateComplianceReport(
            dateRange,
            properties,
            filters
          );
          break;
        case 'risk':
          reportData = await generateRiskReport(dateRange, properties, filters);
          break;
        case 'maintenance':
          reportData = await generateMaintenanceReport(
            dateRange,
            properties,
            filters
          );
          break;
        case 'staff':
          reportData = await generateStaffReport(
            dateRange,
            properties,
            filters
          );
          break;
        default:
          throw new Error('Invalid report type');
      }

      res.json(reportData);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Individual report endpoints
  app.get('/api/reports/occupancy', isAuthenticated, async (req, res) => {
    try {
      const { dateRange, properties } = req.query;
      const reportData = await generateOccupancyReport(dateRange, properties);
      res.json(reportData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get('/api/reports/financial', isAuthenticated, async (req, res) => {
    try {
      const { dateRange, properties } = req.query;
      const reportData = await generateFinancialReport(dateRange, properties);
      res.json(reportData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all maintenance requests
  app.get('/api/maintenance-requests', isAuthenticated, async (req, res) => {
    try {
      const requests = await storage.getMaintenanceRequests();
      res.json(requests);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create maintenance request
  app.post('/api/maintenance-requests', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertMaintenanceRequestSchema.parse(req.body);
      const request = await storage.createMaintenanceRequest(validatedData);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update maintenance request
  app.put(
    '/api/maintenance-requests/:id',
    isAuthenticated,
    async (req, res) => {
      try {
        const id = parseInt(req.params.id);
        const validatedData = insertMaintenanceRequestSchema
          .partial()
          .parse(req.body);
        const request = await storage.updateMaintenanceRequest(
          id,
          validatedData
        );
        res.json(request);
      } catch (error: any) {
        res.status(400).json({ message: error.message });
      }
    }
  );

  // Get all tenancy agreements
  app.get('/api/tenancy-agreements', isAuthenticated, async (req, res) => {
    try {
      const agreements = await storage.getTenancyAgreements();
      res.json(agreements);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create tenancy agreement
  app.post('/api/tenancy-agreements', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertTenancyAgreementSchema.parse(req.body);
      const agreement = await storage.createTenancyAgreement(validatedData);
      res.status(201).json(agreement);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update tenancy agreement
  app.put('/api/tenancy-agreements/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTenancyAgreementSchema
        .partial()
        .parse(req.body);
      const agreement = await storage.updateTenancyAgreement(id, validatedData);
      res.json(agreement);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all assessment forms
  app.get('/api/assessment-forms', isAuthenticated, async (req, res) => {
    try {
      const forms = await storage.getAssessmentForms();
      res.json(forms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create assessment form
  app.post('/api/assessment-forms', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertAssessmentFormSchema.parse(req.body);
      const form = await storage.createAssessmentForm(validatedData);
      res.status(201).json(form);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update assessment form
  app.put('/api/assessment-forms/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAssessmentFormSchema
        .partial()
        .parse(req.body);
      const form = await storage.updateAssessmentForm(id, validatedData);
      res.json(form);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all staff members
  app.get('/api/staff-members', isAuthenticated, async (req, res) => {
    try {
      const members = await storage.getStaffMembers();
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create staff member
  app.post('/api/staff-members', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertStaffMemberSchema.parse(req.body);
      const member = await storage.createStaffMember(validatedData);
      res.status(201).json(member);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update staff member
  app.put('/api/staff-members/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStaffMemberSchema.partial().parse(req.body);
      const member = await storage.updateStaffMember(id, validatedData);
      res.json(member);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all property rooms
  app.get('/api/property-rooms', isAuthenticated, async (req, res) => {
    try {
      const propertyId = req.query.propertyId
        ? parseInt(req.query.propertyId as string)
        : undefined;
      const rooms = propertyId
        ? await storage.getPropertyRooms(propertyId)
        : await storage.getPropertyRooms(0);
      res.json(rooms);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create property room
  app.post('/api/property-rooms', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPropertyRoomSchema.parse(req.body);
      const room = await storage.createPropertyRoom(validatedData);
      res.status(201).json(room);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Update property room
  app.put('/api/property-rooms/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPropertyRoomSchema.partial().parse(req.body);
      const room = await storage.updatePropertyRoom(id, validatedData);
      res.json(room);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Platform Admin Routes - Protected with enhanced security
  app.get('/api/platform-admin/auth', isAuthenticated, checkPlatformAdminAuth);
  app.get(
    '/api/platform-admin/overview',
    isAuthenticated,
    enhancedPlatformAdminAuth,
    getPlatformOverview
  );
  app.get(
    '/api/platform-admin/subscriptions',
    isAuthenticated,
    enhancedPlatformAdminAuth,
    getPlatformSubscriptions
  );
  app.get(
    '/api/platform-admin/organizations',
    isAuthenticated,
    enhancedPlatformAdminAuth,
    getPlatformOrganizations
  );
  app.get(
    '/api/platform-admin/monitoring',
    isAuthenticated,
    enhancedPlatformAdminAuth,
    getSystemMonitoring
  );
  app.get(
    '/api/platform-admin/analytics',
    isAuthenticated,
    enhancedPlatformAdminAuth,
    getPlatformAnalytics
  );
  app.get(
    '/api/platform-admin/billing',
    isAuthenticated,
    enhancedPlatformAdminAuth,
    getBillingOversight
  );
  app.get(
    '/api/platform-admin/features',
    isAuthenticated,
    enhancedPlatformAdminAuth,
    getFeatureFlags
  );
  app.post(
    '/api/platform-admin/emergency',
    isAuthenticated,
    enhancedPlatformAdminAuth,
    handleEmergencyAction
  );

  // New data aggregation endpoints
  app.get(
    '/api/platform-admin/organization-breakdowns',
    isAuthenticated,
    enhancedPlatformAdminAuth,
    getOrganizationBreakdowns
  );
  app.get(
    '/api/platform-admin/historical-trends',
    isAuthenticated,
    enhancedPlatformAdminAuth,
    getHistoricalTrends
  );
  app.get(
    '/api/platform-admin/real-time-metrics',
    isAuthenticated,
    enhancedPlatformAdminAuth,
    getRealTimeDashboardMetrics
  );
  app.get(
    '/api/platform-admin/export-data',
    isAuthenticated,
    enhancedPlatformAdminAuth,
    exportAggregatedData
  );
  app.get(
    '/api/platform-admin/validate-data',
    isAuthenticated,
    enhancedPlatformAdminAuth,
    validateDataConsistency
  );

  // Billing routes - Government clients
  app.get(
    '/api/billing/government-clients',
    isAuthenticated,
    async (req: any, res: any) => {
      try {
        const clients = await storage.getGovernmentClients();
        res.json(clients);
      } catch (error) {
        console.error('Error fetching government clients:', error);
        res.status(500).json({ message: 'Failed to fetch government clients' });
      }
    }
  );

  app.post(
    '/api/billing/government-clients',
    isAuthenticated,
    async (req: any, res: any) => {
      try {
        const clientData = insertGovernmentClientSchema.parse(req.body);
        const client = await storage.createGovernmentClient(clientData);

        // Log activity
        await storage.createActivity({
          userId: req.user?.claims?.sub,
          activityType: 'government_client_created',
          title: 'New government client added',
          description: `Government client "${client.clientName}" has been added to the billing system`,
          entityId: client.id,
          entityType: 'government_client',
        });

        res.json(client);
      } catch (error) {
        console.error('Error creating government client:', error);
        res.status(500).json({ message: 'Failed to create government client' });
      }
    }
  );

  app.put(
    '/api/billing/government-clients/:id',
    isAuthenticated,
    async (req: any, res: any) => {
      try {
        const id = parseInt(req.params.id);
        const clientData = insertGovernmentClientSchema
          .partial()
          .parse(req.body);
        const client = await storage.updateGovernmentClient(id, clientData);
        res.json(client);
      } catch (error) {
        console.error('Error updating government client:', error);
        res.status(500).json({ message: 'Failed to update government client' });
      }
    }
  );

  app.delete(
    '/api/billing/government-clients/:id',
    isAuthenticated,
    async (req: any, res: any) => {
      try {
        const id = parseInt(req.params.id);
        await storage.deleteGovernmentClient(id);
        res.json({ message: 'Government client deleted successfully' });
      } catch (error) {
        console.error('Error deleting government client:', error);
        res.status(500).json({ message: 'Failed to delete government client' });
      }
    }
  );

  // Billing analytics
  app.get(
    '/api/billing/analytics',
    isAuthenticated,
    async (req: any, res: any) => {
      try {
        const analytics = await storage.getBillingAnalytics();
        res.json(analytics);
      } catch (error) {
        console.error('Error fetching billing analytics:', error);
        res.status(500).json({ message: 'Failed to fetch billing analytics' });
      }
    }
  );

  // SEO-friendly sitemap.xml endpoint
  app.get('/sitemap.xml', (req, res) => {
    try {
      const sitemapUrls = [
        {
          url: 'https://www.yuthub.com',
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 1.0,
        },
        {
          url: 'https://www.yuthub.com/pricing',
          lastmod: new Date().toISOString(),
          changefreq: 'monthly',
          priority: 0.9,
        },
        {
          url: 'https://www.yuthub.com/signup',
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8,
        },
        {
          url: 'https://www.yuthub.com/privacy',
          lastmod: new Date().toISOString(),
          changefreq: 'yearly',
          priority: 0.4,
        },
        {
          url: 'https://www.yuthub.com/terms',
          lastmod: new Date().toISOString(),
          changefreq: 'yearly',
          priority: 0.4,
        },
        {
          url: 'https://www.yuthub.com/cookies',
          lastmod: new Date().toISOString(),
          changefreq: 'yearly',
          priority: 0.3,
        },
        {
          url: 'https://www.yuthub.com/accessibility',
          lastmod: new Date().toISOString(),
          changefreq: 'yearly',
          priority: 0.3,
        },
      ];

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls
  .map(
    url => `  <url>
    <loc>${url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

      res.set({
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400',
      });

      res.send(sitemap);
    } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
    }
  });

  // Return provided server or create new HTTP server
  const httpServer = server || createServer(app);
  return httpServer;
}

// Report generation helper functions
async function generateOccupancyReport(
  dateRange: any,
  properties: any,
  filters?: any
) {
  // Mock implementation - in a real application, this would query the database
  return {
    title: 'Occupancy Report',
    generatedAt: new Date().toISOString(),
    dateRange,
    properties,
    filters,
    data: {
      totalUnits: 50,
      occupiedUnits: 42,
      occupancyRate: 84,
      trends: { occupancy: 2.5 },
    },
  };
}

async function generateFinancialReport(
  dateRange: any,
  properties: any,
  filters?: any
) {
  return {
    title: 'Financial Report',
    generatedAt: new Date().toISOString(),
    dateRange,
    properties,
    filters,
    data: {
      totalIncome: 125000,
      totalExpenses: 98000,
      netProfit: 27000,
      profitMargin: 21.6,
    },
  };
}

async function generateIncidentReport(
  dateRange: any,
  properties: any,
  filters?: any
) {
  return {
    title: 'Incident Report',
    generatedAt: new Date().toISOString(),
    dateRange,
    properties,
    filters,
    data: {
      totalIncidents: 43,
      openIncidents: 12,
      resolvedIncidents: 31,
      averageResolutionTime: 3.2,
    },
  };
}

async function generateProgressReport(
  dateRange: any,
  properties: any,
  filters?: any
) {
  return {
    title: 'Progress Report',
    generatedAt: new Date().toISOString(),
    dateRange,
    properties,
    filters,
    data: {
      totalResidents: 42,
      activeGoals: 45,
      completedGoals: 32,
      averageProgress: 72,
    },
  };
}

async function generateComplianceReport(
  dateRange: any,
  properties: any,
  filters?: any
) {
  return {
    title: 'Compliance Report',
    generatedAt: new Date().toISOString(),
    dateRange,
    properties,
    filters,
    data: {
      complianceScore: 92,
      areasToImprove: ['Staff Training', 'Documentation'],
    },
  };
}

async function generateRiskReport(
  dateRange: any,
  properties: any,
  filters?: any
) {
  return {
    title: 'Risk Assessment Report',
    generatedAt: new Date().toISOString(),
    dateRange,
    properties,
    filters,
    data: {
      highRiskResidents: 3,
      mediumRiskResidents: 8,
      lowRiskResidents: 31,
    },
  };
}

async function generateMaintenanceReport(
  dateRange: any,
  properties: any,
  filters?: any
) {
  return {
    title: 'Maintenance Report',
    generatedAt: new Date().toISOString(),
    dateRange,
    properties,
    filters,
    data: {
      openRequests: 8,
      completedRequests: 15,
      averageCompletionTime: 2.5,
    },
  };
}

async function generateStaffReport(
  dateRange: any,
  properties: any,
  filters?: any
) {
  return {
    title: 'Staff Performance Report',
    generatedAt: new Date().toISOString(),
    dateRange,
    properties,
    filters,
    data: {
      totalStaff: 12,
      averageWorkload: 3.2,
      trainingCompletion: 85,
    },
  };
}
