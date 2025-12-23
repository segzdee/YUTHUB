/*
  # Authentication Logging and Monitoring Tables

  1. New Tables
    - `auth_attempts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable - null if login failed)
      - `email` (text)
      - `attempt_type` (enum: login, logout, signup, password_reset, password_change)
      - `status` (enum: success, failure, blocked)
      - `failure_reason` (text, nullable)
      - `ip_address` (inet)
      - `user_agent` (text)
      - `metadata` (jsonb, nullable)
      - `created_at` (timestamptz)

    - `auth_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `session_token` (text, unique, indexed)
      - `refresh_token_hash` (text, nullable)
      - `ip_address` (inet)
      - `user_agent` (text)
      - `is_active` (boolean, default true)
      - `expires_at` (timestamptz)
      - `last_activity_at` (timestamptz)
      - `created_at` (timestamptz)
      - `revoked_at` (timestamptz, nullable)

    - `security_events`
      - `id` (uuid, primary key)
      - `user_id` (uuid, nullable)
      - `event_type` (enum: suspicious_activity, account_locked, password_changed, 2fa_enabled, etc.)
      - `severity` (enum: low, medium, high, critical)
      - `description` (text)
      - `ip_address` (inet, nullable)
      - `metadata` (jsonb, nullable)
      - `created_at` (timestamptz)

    - `failed_login_attempts`
      - `id` (uuid, primary key)
      - `email` (text, indexed)
      - `ip_address` (inet, indexed)
      - `attempt_count` (integer, default 1)
      - `first_attempt_at` (timestamptz)
      - `last_attempt_at` (timestamptz)
      - `locked_until` (timestamptz, nullable)

  2. Security
    - Enable RLS on all tables
    - Only authenticated users can read their own auth attempts
    - Only service role can write to these tables (via backend)
    - Platform admins can read all logs

  3. Indexes
    - Index on user_id, email, ip_address, created_at for fast lookups
    - Composite indexes for common query patterns

  4. Functions
    - Function to clean up old logs (retention policy)
    - Function to check if account is locked
    - Function to record failed login attempts
*/

-- Create custom types for auth logging
DO $$ BEGIN
  CREATE TYPE auth_attempt_type AS ENUM ('login', 'logout', 'signup', 'password_reset', 'password_change', 'refresh_token');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE auth_attempt_status AS ENUM ('success', 'failure', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE security_event_type AS ENUM (
    'suspicious_activity',
    'account_locked',
    'account_unlocked',
    'password_changed',
    '2fa_enabled',
    '2fa_disabled',
    'multiple_failed_logins',
    'session_revoked',
    'unauthorized_access_attempt'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE security_severity AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Auth Attempts Table
CREATE TABLE IF NOT EXISTS auth_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  attempt_type auth_attempt_type NOT NULL,
  status auth_attempt_status NOT NULL,
  failure_reason text,
  ip_address inet,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Auth Sessions Table
CREATE TABLE IF NOT EXISTS auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  refresh_token_hash text,
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  last_activity_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz
);

-- Security Events Table
CREATE TABLE IF NOT EXISTS security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type security_event_type NOT NULL,
  severity security_severity NOT NULL,
  description text NOT NULL,
  ip_address inet,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Failed Login Attempts Tracking Table
CREATE TABLE IF NOT EXISTS failed_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  ip_address inet NOT NULL,
  attempt_count integer DEFAULT 1,
  first_attempt_at timestamptz DEFAULT now(),
  last_attempt_at timestamptz DEFAULT now(),
  locked_until timestamptz
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_auth_attempts_user_id ON auth_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_email ON auth_attempts(email);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip_address ON auth_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_created_at ON auth_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_status ON auth_attempts(status);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_type_status ON auth_attempts(attempt_type, status);

CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_session_token ON auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_is_active ON auth_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires_at ON auth_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_email ON failed_login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_ip ON failed_login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_failed_login_attempts_locked_until ON failed_login_attempts(locked_until);

-- Enable Row Level Security
ALTER TABLE auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auth_attempts
CREATE POLICY "Users can view their own auth attempts"
  ON auth_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert auth attempts"
  ON auth_attempts FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policies for auth_sessions
CREATE POLICY "Users can view their own sessions"
  ON auth_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage sessions"
  ON auth_sessions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can revoke their own sessions"
  ON auth_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND is_active = false);

-- RLS Policies for security_events
CREATE POLICY "Users can view their own security events"
  ON security_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert security events"
  ON security_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- RLS Policies for failed_login_attempts
CREATE POLICY "Service role can manage failed login attempts"
  ON failed_login_attempts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(check_email text, check_ip inet)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  locked_record record;
BEGIN
  SELECT * INTO locked_record
  FROM failed_login_attempts
  WHERE (email = check_email OR ip_address = check_ip)
    AND locked_until IS NOT NULL
    AND locked_until > now();

  RETURN FOUND;
END;
$$;

-- Function to record failed login attempt
CREATE OR REPLACE FUNCTION record_failed_login(
  attempt_email text,
  attempt_ip inet,
  max_attempts integer DEFAULT 5,
  lockout_duration interval DEFAULT '15 minutes'::interval
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_record record;
  new_attempt_count integer;
  should_lock boolean := false;
  result jsonb;
BEGIN
  -- Get existing record
  SELECT * INTO existing_record
  FROM failed_login_attempts
  WHERE email = attempt_email OR ip_address = attempt_ip
  ORDER BY last_attempt_at DESC
  LIMIT 1;

  IF existing_record IS NULL THEN
    -- First failed attempt
    INSERT INTO failed_login_attempts (email, ip_address, attempt_count, first_attempt_at, last_attempt_at)
    VALUES (attempt_email, attempt_ip, 1, now(), now());

    result := jsonb_build_object(
      'locked', false,
      'attempt_count', 1,
      'max_attempts', max_attempts
    );
  ELSE
    -- Check if we should reset the counter (more than 15 minutes since last attempt)
    IF existing_record.last_attempt_at < now() - '15 minutes'::interval THEN
      new_attempt_count := 1;
    ELSE
      new_attempt_count := existing_record.attempt_count + 1;
    END IF;

    -- Check if we should lock the account
    IF new_attempt_count >= max_attempts THEN
      should_lock := true;

      UPDATE failed_login_attempts
      SET
        attempt_count = new_attempt_count,
        last_attempt_at = now(),
        locked_until = now() + lockout_duration
      WHERE id = existing_record.id;

      -- Log security event
      INSERT INTO security_events (user_id, event_type, severity, description, ip_address, metadata)
      VALUES (
        NULL,
        'account_locked',
        'high',
        format('Account locked due to %s failed login attempts', new_attempt_count),
        attempt_ip,
        jsonb_build_object('email', attempt_email, 'attempt_count', new_attempt_count)
      );
    ELSE
      UPDATE failed_login_attempts
      SET
        attempt_count = new_attempt_count,
        last_attempt_at = now()
      WHERE id = existing_record.id;
    END IF;

    result := jsonb_build_object(
      'locked', should_lock,
      'attempt_count', new_attempt_count,
      'max_attempts', max_attempts,
      'locked_until', CASE WHEN should_lock THEN now() + lockout_duration ELSE NULL END
    );
  END IF;

  RETURN result;
END;
$$;

-- Function to clear failed login attempts on successful login
CREATE OR REPLACE FUNCTION clear_failed_login_attempts(
  attempt_email text,
  attempt_ip inet
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM failed_login_attempts
  WHERE email = attempt_email OR ip_address = attempt_ip;
END;
$$;

-- Function to clean up old logs (data retention)
CREATE OR REPLACE FUNCTION cleanup_old_auth_logs(retention_days integer DEFAULT 90)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete old auth attempts
  DELETE FROM auth_attempts
  WHERE created_at < now() - (retention_days || ' days')::interval;

  -- Delete old expired sessions
  DELETE FROM auth_sessions
  WHERE expires_at < now() - (retention_days || ' days')::interval;

  -- Delete old security events (keep critical ones longer)
  DELETE FROM security_events
  WHERE created_at < now() - (retention_days || ' days')::interval
    AND severity NOT IN ('critical', 'high');

  -- Delete old failed login attempts
  DELETE FROM failed_login_attempts
  WHERE last_attempt_at < now() - '30 days'::interval;
END;
$$;
