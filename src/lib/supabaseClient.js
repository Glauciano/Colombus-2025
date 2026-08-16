import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Supabase is only "configured" if env vars exist AND user has explicitly enabled it
export const isSupabaseConfigured = () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
  if (SUPABASE_URL.includes('YOUR_PROJECT') || SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY')) return false;
  return localStorage.getItem('colombus_supabase_enabled') === 'true';
};

export const hasSupabaseCredentials = () => {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY && 
    !SUPABASE_URL.includes('YOUR_PROJECT') && 
    !SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY'));
};

export const enableSupabase = () => {
  localStorage.setItem('colombus_supabase_enabled', 'true');
  window.location.reload();
};

export const disableSupabase = () => {
  localStorage.setItem('colombus_supabase_enabled', 'false');
  window.location.reload();
};

export const isSupabaseEnabled = () => {
  return localStorage.getItem('colombus_supabase_enabled') === 'true';
};
