import { createClient } from '@supabase/supabase-js';

// Try to get from environment variables first, fallback to direct values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rjvpfprlvjdrcgtegohv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqdnBmcHJsdmpkcmNndGVnb2h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MjI4MDIsImV4cCI6MjA3OTk5ODgwMn0.lx0hjqcyP-0fB8u7QAaMs-9VAPgBTA2NZ6WJfSaDOSs';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase environment variables missing:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing',
    env: import.meta.env,
  });

  throw new Error(
    'Missing Supabase environment variables. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file and restart the dev server.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
