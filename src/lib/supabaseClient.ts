/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env file.");
}

// Auth + data client: uses the anon key and the logged-in admin's session (JWT).
// All CRUD relies on Supabase RLS policies scoped to `authenticated` users.
// NEVER ship the service-role key to the browser.
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
