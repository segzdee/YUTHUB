import crypto from 'crypto';
import { supabase } from '../config/supabase.js';

const SESSION_DURATION = 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60 * 1000;

export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

export function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createSession(userId, ipAddress, userAgent) {
  try {
    const sessionToken = generateSessionToken();
    const refreshToken = generateSessionToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    const { data, error } = await supabase
      .from('auth_sessions')
      .insert({
        user_id: userId,
        session_token: sessionToken,
        refresh_token_hash: refreshTokenHash,
        ip_address: ipAddress,
        user_agent: userAgent,
        is_active: true,
        expires_at: expiresAt.toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Session creation error:', error);
      throw new Error('Failed to create session');
    }

    return {
      sessionToken,
      refreshToken,
      expiresAt,
      sessionId: data.id,
    };
  } catch (error) {
    console.error('Create session error:', error);
    throw error;
  }
}

export async function validateSession(sessionToken) {
  try {
    const { data, error } = await supabase
      .from('auth_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { isValid: false, session: null };
    }

    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (now > expiresAt) {
      await revokeSession(sessionToken);
      return { isValid: false, session: null };
    }

    await supabase
      .from('auth_sessions')
      .update({ last_activity_at: now.toISOString() })
      .eq('id', data.id);

    return { isValid: true, session: data };
  } catch (error) {
    console.error('Validate session error:', error);
    return { isValid: false, session: null };
  }
}

export async function refreshSessionToken(refreshToken) {
  try {
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const { data, error } = await supabase
      .from('auth_sessions')
      .select('*')
      .eq('refresh_token_hash', refreshTokenHash)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return { success: false, session: null };
    }

    const now = new Date();
    const expiresAt = new Date(data.expires_at);

    if (now > expiresAt) {
      await revokeSession(data.session_token);
      return { success: false, session: null };
    }

    const newSessionToken = generateSessionToken();
    const newRefreshToken = generateSessionToken();
    const newRefreshTokenHash = hashRefreshToken(newRefreshToken);
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION);

    const { data: updatedSession, error: updateError } = await supabase
      .from('auth_sessions')
      .update({
        session_token: newSessionToken,
        refresh_token_hash: newRefreshTokenHash,
        expires_at: newExpiresAt.toISOString(),
        last_activity_at: now.toISOString(),
      })
      .eq('id', data.id)
      .select()
      .single();

    if (updateError) {
      console.error('Session refresh error:', updateError);
      return { success: false, session: null };
    }

    return {
      success: true,
      sessionToken: newSessionToken,
      refreshToken: newRefreshToken,
      expiresAt: newExpiresAt,
      session: updatedSession,
    };
  } catch (error) {
    console.error('Refresh session error:', error);
    return { success: false, session: null };
  }
}

export async function revokeSession(sessionToken) {
  try {
    const { error } = await supabase
      .from('auth_sessions')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('session_token', sessionToken);

    if (error) {
      console.error('Revoke session error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Revoke session error:', error);
    return false;
  }
}

export async function revokeAllUserSessions(userId) {
  try {
    const { error } = await supabase
      .from('auth_sessions')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Revoke all sessions error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Revoke all sessions error:', error);
    return false;
  }
}

export async function getUserSessions(userId) {
  try {
    const { data, error } = await supabase
      .from('auth_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get user sessions error:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get user sessions error:', error);
    return [];
  }
}

export async function cleanupExpiredSessions() {
  try {
    const { error } = await supabase
      .from('auth_sessions')
      .update({
        is_active: false,
        revoked_at: new Date().toISOString(),
      })
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Cleanup expired sessions error:', error);
    }
  } catch (error) {
    console.error('Cleanup expired sessions error:', error);
  }
}

export function setCookieOptions(isProduction = false) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: SESSION_DURATION,
    path: '/',
  };
}

export function setRefreshCookieOptions(isProduction = false) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_DURATION,
    path: '/api/auth/refresh',
  };
}
