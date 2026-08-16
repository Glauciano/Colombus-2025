import { createClient } from '@supabase/supabase-js';

// Credenciais do Supabase (anon key é pública, segura para usar no frontend)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cmoaiyhwmrsaihibfhux.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AUHiIr1CvseO8Uy-XtqFyw_L3ELN2-4';

// Só cria o client se tiver as credenciais
const hasCredentials = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase = hasCredentials 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) 
  : null;

// Supabase ATIVO POR PADRÃO — usa nuvem ao invés de localStorage
export const isSupabaseConfigured = () => {
  if (!hasCredentials) return false;
  // Se nunca definiu, retorna true (ativo por padrão)
  const stored = localStorage.getItem('colombus_supabase_enabled');
  return stored === null || stored === 'true';
};

export const hasSupabaseCredentials = () => hasCredentials;

export const enableSupabase = () => {
  localStorage.setItem('colombus_supabase_enabled', 'true');
  window.location.reload();
};

export const disableSupabase = () => {
  localStorage.setItem('colombus_supabase_enabled', 'false');
  window.location.reload();
};

export const isSupabaseEnabled = () => {
  const stored = localStorage.getItem('colombus_supabase_enabled');
  // Ativo por padrão se nunca foi definido
  return stored === null || stored === 'true';
};
