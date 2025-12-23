import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateUser } from '../middleware/auth.js';
import { validatePasswordStrength } from '../utils/passwordValidator.js';
import {
  createSession,
  validateSession,
  refreshSessionToken,
  revokeSession,
  revokeAllUserSessions,
  getUserSessions,
  setCookieOptions,
  setRefreshCookieOptions,
} from '../utils/sessionManager.js';
import {
  logAuthAttempt,
  logSecurityEvent,
  checkAccountLockout,
  recordFailedLogin,
  clearFailedAttempts,
  detectSuspiciousActivity,
} from '../middleware/authLogger.js';
import {
  sanitizeEmail,
  sanitizeName,
  validateEmail,
} from '../utils/inputSanitizer.js';

const router = express.Router();
const isProduction = process.env.NODE_ENV === 'production';

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    'unknown'
  );
}

router.post('/register', async (req, res) => {
  try {
    let { email, password, firstName, lastName, organizationName, organizationType } =
      req.body;

    email = sanitizeEmail(email);
    firstName = sanitizeName(firstName);
    lastName = sanitizeName(lastName);
    organizationName = sanitizeName(organizationName);

    if (!email || !password || !firstName || !lastName || !organizationName) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['email', 'password', 'firstName', 'lastName', 'organizationName'],
      });
    }

    if (!validateEmail(email)) {
      await logAuthAttempt(email, 'signup', 'failure', null, 'Invalid email format', req);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      await logAuthAttempt(
        email,
        'signup',
        'failure',
        null,
        'Weak password: ' + passwordValidation.errors.join(', '),
        req
      );
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors,
        warnings: passwordValidation.warnings,
      });
    }

    const ipAddress = getClientIp(req);
    const isLocked = await checkAccountLockout(email, ipAddress);

    if (isLocked) {
      await logAuthAttempt(email, 'signup', 'blocked', null, 'Account locked', req);
      return res.status(403).json({
        error: 'Account temporarily locked due to multiple failed attempts. Please try again later.',
      });
    }

    let authData, org;

    try {
      const { data: signUpData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            name: `${firstName} ${lastName}`,
          },
        },
      });

      if (authError) {
        await logAuthAttempt(email, 'signup', 'failure', null, authError.message, req);
        return res.status(400).json({ error: authError.message });
      }

      if (!signUpData.user) {
        await logAuthAttempt(email, 'signup', 'failure', null, 'User creation failed', req);
        return res.status(400).json({ error: 'Failed to create user' });
      }

      authData = signUpData;

      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: organizationName,
          display_name: organizationName,
          slug: organizationName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          organization_type: organizationType || 'housing_association',
          status: 'active',
          subscription_tier: 'trial',
          subscription_status: 'trialing',
          trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (orgError) {
        console.error('Organization creation error:', orgError);

        await supabase.auth.admin.deleteUser(authData.user.id);

        await logAuthAttempt(
          email,
          'signup',
          'failure',
          authData.user.id,
          'Organization creation failed',
          req
        );
        return res.status(500).json({ error: 'Failed to create organization' });
      }

      org = orgData;

      const { error: linkError } = await supabase.from('user_organizations').insert({
        user_id: authData.user.id,
        organization_id: org.id,
        role: 'owner',
        status: 'active',
      });

      if (linkError) {
        console.error('User-organization link error:', linkError);

        await supabase.from('organizations').delete().eq('id', org.id);
        await supabase.auth.admin.deleteUser(authData.user.id);

        await logAuthAttempt(
          email,
          'signup',
          'failure',
          authData.user.id,
          'Organization linking failed',
          req
        );
        return res.status(500).json({ error: 'Failed to link user to organization' });
      }

      const userAgent = req.headers['user-agent'] || 'unknown';
      const { sessionToken, refreshToken, expiresAt } = await createSession(
        authData.user.id,
        ipAddress,
        userAgent
      );

      res.cookie('session_token', sessionToken, setCookieOptions(isProduction));
      res.cookie('refresh_token', refreshToken, setRefreshCookieOptions(isProduction));

      await logAuthAttempt(email, 'signup', 'success', authData.user.id, null, req);

      res.status(201).json({
        user: authData.user,
        organization: org,
        expiresAt,
      });
    } catch (innerError) {
      console.error('Registration transaction error:', innerError);

      if (authData?.user?.id) {
        await supabase.auth.admin.deleteUser(authData.user.id);
      }
      if (org?.id) {
        await supabase.from('organizations').delete().eq('id', org.id);
      }

      await logAuthAttempt(email, 'signup', 'failure', null, innerError.message, req);
      throw innerError;
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    let { email, password } = req.body;

    email = sanitizeEmail(email);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const ipAddress = getClientIp(req);

    const isLocked = await checkAccountLockout(email, ipAddress);
    if (isLocked) {
      await logAuthAttempt(email, 'login', 'blocked', null, 'Account locked', req);
      return res.status(403).json({
        error: 'Account temporarily locked due to multiple failed attempts. Please try again later.',
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const lockoutResult = await recordFailedLogin(email, ipAddress);

      await logAuthAttempt(email, 'login', 'failure', null, error.message, req);

      if (lockoutResult.locked) {
        return res.status(403).json({
          error: 'Too many failed login attempts. Account temporarily locked for 15 minutes.',
          locked_until: lockoutResult.locked_until,
        });
      }

      return res.status(401).json({
        error: error.message,
        attempts_remaining: lockoutResult.max_attempts - lockoutResult.attempt_count,
      });
    }

    await clearFailedAttempts(email, ipAddress);

    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id, role, organizations(*)')
      .eq('user_id', data.user.id)
      .eq('status', 'active')
      .single();

    const userAgent = req.headers['user-agent'] || 'unknown';
    const { sessionToken, refreshToken, expiresAt } = await createSession(
      data.user.id,
      ipAddress,
      userAgent
    );

    res.cookie('session_token', sessionToken, setCookieOptions(isProduction));
    res.cookie('refresh_token', refreshToken, setRefreshCookieOptions(isProduction));

    await logAuthAttempt(email, 'login', 'success', data.user.id, null, req);

    await detectSuspiciousActivity(data.user.id, ipAddress, req);

    res.json({
      user: data.user,
      organization: userOrg?.organizations || null,
      role: userOrg?.role || null,
      expiresAt,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', authenticateUser, async (req, res) => {
  try {
    const sessionToken = req.cookies?.session_token;

    if (sessionToken) {
      await revokeSession(sessionToken);
    }

    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      await supabase.auth.admin.signOut(token);
    }

    res.clearCookie('session_token');
    res.clearCookie('refresh_token');

    await logAuthAttempt(req.user?.email || 'unknown', 'logout', 'success', req.userId, null, req);

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token || req.body.refresh_token;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const result = await refreshSessionToken(refreshToken);

    if (!result.success) {
      res.clearCookie('session_token');
      res.clearCookie('refresh_token');
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    res.cookie('session_token', result.sessionToken, setCookieOptions(isProduction));
    res.cookie('refresh_token', result.refreshToken, setRefreshCookieOptions(isProduction));

    await logAuthAttempt(
      result.session.user_id,
      'refresh_token',
      'success',
      result.session.user_id,
      null,
      req
    );

    res.json({
      expiresAt: result.expiresAt,
      message: 'Session refreshed successfully',
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    let { email } = req.body;

    email = sanitizeEmail(email);

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });

    if (error) {
      await logAuthAttempt(email, 'password_reset', 'failure', null, error.message, req);
      return res.status(400).json({ error: error.message });
    }

    await logAuthAttempt(email, 'password_reset', 'success', null, null, req);

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Password does not meet security requirements',
        details: passwordValidation.errors,
        warnings: passwordValidation.warnings,
      });
    }

    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    await revokeAllUserSessions(data.user.id);

    await logAuthAttempt(
      data.user.email,
      'password_change',
      'success',
      data.user.id,
      null,
      req
    );

    await logSecurityEvent(
      'password_changed',
      'medium',
      'User password was changed',
      data.user.id,
      getClientIp(req)
    );

    res.json({ message: 'Password reset successfully', user: data.user });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authenticateUser, async (req, res) => {
  try {
    const { data: userOrg } = await supabase
      .from('user_organizations')
      .select('organization_id, role, status, organizations(*)')
      .eq('user_id', req.userId)
      .eq('status', 'active')
      .single();

    res.json({
      user: req.user,
      organization: userOrg?.organizations || null,
      role: userOrg?.role || null,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/sessions', authenticateUser, async (req, res) => {
  try {
    const sessions = await getUserSessions(req.userId);

    const sanitizedSessions = sessions.map((session) => ({
      id: session.id,
      ip_address: session.ip_address,
      user_agent: session.user_agent,
      created_at: session.created_at,
      last_activity_at: session.last_activity_at,
      is_active: session.is_active,
    }));

    res.json({ sessions: sanitizedSessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/sessions/:sessionId', authenticateUser, async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { data: session } = await supabase
      .from('auth_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', req.userId)
      .single();

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await revokeSession(session.session_token);

    await logSecurityEvent(
      'session_revoked',
      'low',
      'User revoked a session',
      req.userId,
      getClientIp(req),
      { session_id: sessionId }
    );

    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
