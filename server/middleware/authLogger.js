import { supabase } from '../config/supabase.js';

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

function getUserAgent(req) {
  return req.headers['user-agent'] || 'unknown';
}

export async function logAuthAttempt(
  email,
  attemptType,
  status,
  userId = null,
  failureReason = null,
  req = null,
  metadata = {}
) {
  try {
    const ipAddress = req ? getClientIp(req) : null;
    const userAgent = req ? getUserAgent(req) : null;

    const { error } = await supabase.from('auth_attempts').insert({
      user_id: userId,
      email,
      attempt_type: attemptType,
      status,
      failure_reason: failureReason,
      ip_address: ipAddress,
      user_agent: userAgent,
      metadata,
    });

    if (error) {
      console.error('Auth attempt logging error:', error);
    }
  } catch (error) {
    console.error('Auth attempt logging error:', error);
  }
}

export async function logSecurityEvent(
  eventType,
  severity,
  description,
  userId = null,
  ipAddress = null,
  metadata = {}
) {
  try {
    const { error } = await supabase.from('security_events').insert({
      user_id: userId,
      event_type: eventType,
      severity,
      description,
      ip_address: ipAddress,
      metadata,
    });

    if (error) {
      console.error('Security event logging error:', error);
    }
  } catch (error) {
    console.error('Security event logging error:', error);
  }
}

export async function checkAccountLockout(email, ipAddress) {
  try {
    const { data, error } = await supabase.rpc('is_account_locked', {
      check_email: email,
      check_ip: ipAddress,
    });

    if (error) {
      console.error('Check account lockout error:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Check account lockout error:', error);
    return false;
  }
}

export async function recordFailedLogin(email, ipAddress) {
  try {
    const { data, error } = await supabase.rpc('record_failed_login', {
      attempt_email: email,
      attempt_ip: ipAddress,
      max_attempts: 5,
      lockout_duration: '15 minutes',
    });

    if (error) {
      console.error('Record failed login error:', error);
      return { locked: false, attempt_count: 0 };
    }

    return data;
  } catch (error) {
    console.error('Record failed login error:', error);
    return { locked: false, attempt_count: 0 };
  }
}

export async function clearFailedAttempts(email, ipAddress) {
  try {
    const { error } = await supabase.rpc('clear_failed_login_attempts', {
      attempt_email: email,
      attempt_ip: ipAddress,
    });

    if (error) {
      console.error('Clear failed attempts error:', error);
    }
  } catch (error) {
    console.error('Clear failed attempts error:', error);
  }
}

export function authLoggingMiddleware(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function (body) {
    const statusCode = res.statusCode;

    if (req.path.includes('/auth/login') && statusCode === 200 && body.user) {
      logAuthAttempt(
        body.user.email || req.body.email,
        'login',
        'success',
        body.user.id,
        null,
        req
      );
    } else if (req.path.includes('/auth/login') && statusCode >= 400) {
      logAuthAttempt(
        req.body.email,
        'login',
        'failure',
        null,
        body.error || body.message,
        req
      );
    } else if (req.path.includes('/auth/register') && statusCode === 201 && body.user) {
      logAuthAttempt(
        body.user.email || req.body.email,
        'signup',
        'success',
        body.user.id,
        null,
        req
      );
    } else if (req.path.includes('/auth/register') && statusCode >= 400) {
      logAuthAttempt(
        req.body.email,
        'signup',
        'failure',
        null,
        body.error || body.message,
        req
      );
    } else if (req.path.includes('/auth/logout') && statusCode === 200) {
      logAuthAttempt(
        req.user?.email || 'unknown',
        'logout',
        'success',
        req.userId,
        null,
        req
      );
    }

    return originalJson(body);
  };

  next();
}

export async function detectSuspiciousActivity(userId, ipAddress, req) {
  try {
    const { data: recentAttempts, error } = await supabase
      .from('auth_attempts')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 15 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Suspicious activity detection error:', error);
      return false;
    }

    const failedAttempts = recentAttempts?.filter(
      (attempt) => attempt.status === 'failure'
    ).length || 0;

    if (failedAttempts >= 3) {
      await logSecurityEvent(
        'suspicious_activity',
        'high',
        `Multiple failed authentication attempts detected: ${failedAttempts} attempts in 15 minutes`,
        userId,
        ipAddress,
        {
          failed_attempts: failedAttempts,
          time_window: '15 minutes',
        }
      );
      return true;
    }

    const uniqueIps = new Set(
      recentAttempts?.map((attempt) => attempt.ip_address) || []
    );

    if (uniqueIps.size >= 3) {
      await logSecurityEvent(
        'suspicious_activity',
        'medium',
        `Multiple IP addresses detected for single user: ${uniqueIps.size} different IPs`,
        userId,
        ipAddress,
        {
          unique_ips: uniqueIps.size,
          time_window: '15 minutes',
        }
      );
      return true;
    }

    return false;
  } catch (error) {
    console.error('Suspicious activity detection error:', error);
    return false;
  }
}
