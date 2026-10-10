import { createClient } from '@supabase/supabase-js'

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://oflvshjkdgyxvcjgxftl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mbHZzaGprZGd5eHZjamd4ZnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNzQxNTgsImV4cCI6MjA3NTg1MDE1OH0.8F9Gw220NxNdiLEQZct_QS9bpg6dkpP6Qw6ooWsVxF8';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or anon key is not set. Please update lib/supabaseClient.ts");
  // You might want to throw an error here to stop the app from running
  // throw new Error("Supabase credentials are not set.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);