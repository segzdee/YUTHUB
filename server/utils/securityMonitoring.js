import { supabase } from '../config/supabase.js';

export async function getSecurityDashboard(timeRange = '24h') {
  try {
    const now = new Date();
    let startTime;

    switch (timeRange) {
      case '1h':
        startTime = new Date(now - 60 * 60 * 1000);
        break;
      case '24h':
        startTime = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startTime = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startTime = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startTime = new Date(now - 24 * 60 * 60 * 1000);
    }

    const { data: authAttempts } = await supabase
      .from('auth_attempts')
      .select('*')
      .gte('created_at', startTime.toISOString());

    const { data: securityEvents } = await supabase
      .from('security_events')
      .select('*')
      .gte('created_at', startTime.toISOString());

    const { data: activeSessions } = await supabase
      .from('auth_sessions')
      .select('*')
      .eq('is_active', true);

    const { data: lockedAccounts } = await supabase
      .from('failed_login_attempts')
      .select('*')
      .gte('locked_until', now.toISOString());

    const totalAttempts = authAttempts?.length || 0;
    const successfulLogins = authAttempts?.filter(
      (a) => a.attempt_type === 'login' && a.status === 'success'
    ).length || 0;
    const failedLogins = authAttempts?.filter(
      (a) => a.attempt_type === 'login' && a.status === 'failure'
    ).length || 0;
    const blockedAttempts = authAttempts?.filter(
      (a) => a.status === 'blocked'
    ).length || 0;

    const criticalEvents = securityEvents?.filter(
      (e) => e.severity === 'critical'
    ).length || 0;
    const highEvents = securityEvents?.filter(
      (e) => e.severity === 'high'
    ).length || 0;

    const topFailedIps = getTopItems(
      authAttempts?.filter((a) => a.status === 'failure'),
      'ip_address',
      5
    );

    const topFailedEmails = getTopItems(
      authAttempts?.filter((a) => a.status === 'failure'),
      'email',
      5
    );

    return {
      summary: {
        total_attempts: totalAttempts,
        successful_logins: successfulLogins,
        failed_logins: failedLogins,
        blocked_attempts: blockedAttempts,
        active_sessions: activeSessions?.length || 0,
        locked_accounts: lockedAccounts?.length || 0,
        critical_events: criticalEvents,
        high_severity_events: highEvents,
        success_rate: totalAttempts > 0
          ? ((successfulLogins / totalAttempts) * 100).toFixed(2)
          : 0,
      },
      recent_events: securityEvents?.slice(0, 10) || [],
      top_failed_ips: topFailedIps,
      top_failed_emails: topFailedEmails,
      locked_accounts: lockedAccounts?.map((acc) => ({
        email: acc.email,
        ip_address: acc.ip_address,
        attempt_count: acc.attempt_count,
        locked_until: acc.locked_until,
      })) || [],
      time_range: timeRange,
      generated_at: now.toISOString(),
    };
  } catch (error) {
    console.error('Security dashboard error:', error);
    throw error;
  }
}

export async function getAuthAttemptsByTimeframe(timeframe = 'hour', limit = 24) {
  try {
    const { data, error } = await supabase
      .from('auth_attempts')
      .select('created_at, attempt_type, status')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) throw error;

    const grouped = {};
    data?.forEach((attempt) => {
      const date = new Date(attempt.created_at);
      let key;

      if (timeframe === 'hour') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
      } else if (timeframe === 'day') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = {
          timestamp: key,
          success: 0,
          failure: 0,
          blocked: 0,
          total: 0,
        };
      }

      grouped[key][attempt.status]++;
      grouped[key].total++;
    });

    return Object.values(grouped)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  } catch (error) {
    console.error('Get auth attempts by timeframe error:', error);
    return [];
  }
}

export async function getUserSecurityHistory(userId, limit = 50) {
  try {
    const { data: attempts } = await supabase
      .from('auth_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data: events } = await supabase
      .from('security_events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    const { data: sessions } = await supabase
      .from('auth_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    return {
      auth_attempts: attempts || [],
      security_events: events || [],
      sessions: sessions || [],
    };
  } catch (error) {
    console.error('Get user security history error:', error);
    throw error;
  }
}

export async function getAnomalousActivity(threshold = 5) {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const { data: recentAttempts } = await supabase
      .from('auth_attempts')
      .select('*')
      .gte('created_at', oneHourAgo.toISOString());

    const ipCounts = {};
    const emailCounts = {};

    recentAttempts?.forEach((attempt) => {
      if (attempt.status === 'failure') {
        ipCounts[attempt.ip_address] = (ipCounts[attempt.ip_address] || 0) + 1;
        emailCounts[attempt.email] = (emailCounts[attempt.email] || 0) + 1;
      }
    });

    const suspiciousIps = Object.entries(ipCounts)
      .filter(([ip, count]) => count >= threshold)
      .map(([ip, count]) => ({ ip, count }))
      .sort((a, b) => b.count - a.count);

    const suspiciousEmails = Object.entries(emailCounts)
      .filter(([email, count]) => count >= threshold)
      .map(([email, count]) => ({ email, count }))
      .sort((a, b) => b.count - a.count);

    return {
      suspicious_ips: suspiciousIps,
      suspicious_emails: suspiciousEmails,
      threshold,
      time_window: '1 hour',
    };
  } catch (error) {
    console.error('Get anomalous activity error:', error);
    return {
      suspicious_ips: [],
      suspicious_emails: [],
      threshold,
      time_window: '1 hour',
    };
  }
}

export async function getSecurityMetrics() {
  try {
    const { data: totalUsers } = await supabase.rpc('count_users');

    const { data: activeSessionsCount } = await supabase
      .from('auth_sessions')
      .select('count', { count: 'exact' })
      .eq('is_active', true);

    const { data: lockedAccountsCount } = await supabase
      .from('failed_login_attempts')
      .select('count', { count: 'exact' })
      .gte('locked_until', new Date().toISOString());

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const { data: recentFailures } = await supabase
      .from('auth_attempts')
      .select('count', { count: 'exact' })
      .eq('status', 'failure')
      .gte('created_at', oneHourAgo.toISOString());

    const { data: recentSuccesses } = await supabase
      .from('auth_attempts')
      .select('count', { count: 'exact' })
      .eq('status', 'success')
      .gte('created_at', oneHourAgo.toISOString());

    return {
      total_users: totalUsers || 0,
      active_sessions: activeSessionsCount?.count || 0,
      locked_accounts: lockedAccountsCount?.count || 0,
      recent_failures: recentFailures?.count || 0,
      recent_successes: recentSuccesses?.count || 0,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Get security metrics error:', error);
    return {
      total_users: 0,
      active_sessions: 0,
      locked_accounts: 0,
      recent_failures: 0,
      recent_successes: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

function getTopItems(items, field, limit = 5) {
  if (!items || items.length === 0) return [];

  const counts = {};

  items.forEach((item) => {
    const value = item[field];
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function alertOnCriticalEvents() {
  try {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const { data: criticalEvents } = await supabase
      .from('security_events')
      .select('*')
      .in('severity', ['critical', 'high'])
      .gte('created_at', fiveMinutesAgo.toISOString());

    if (criticalEvents && criticalEvents.length > 0) {
      console.warn(`[SECURITY ALERT] ${criticalEvents.length} critical/high severity events detected:`);
      criticalEvents.forEach((event) => {
        console.warn(`  - [${event.severity.toUpperCase()}] ${event.event_type}: ${event.description}`);
      });

      return criticalEvents;
    }

    return [];
  } catch (error) {
    console.error('Alert on critical events error:', error);
    return [];
  }
}
