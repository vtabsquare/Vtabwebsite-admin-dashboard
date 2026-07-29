/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env file.");
}

// Auth client: used ONLY for login/session management (uses anon key)
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Admin client: used for ALL data operations (bypasses RLS entirely via service role key)
// This ensures that admin dashboard CRUD always works regardless of the logged-in user's RLS policies
export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || supabaseAnonKey || '', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
