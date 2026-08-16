import { supabase, isSupabaseConfigured } from './supabase';
import { db as localDb, ENTITIES, formatCurrency, formatDate } from './db';

// Map our entity names to Supabase table names
const TABLE_MAP = {
  [ENTITIES.PROVA]: 'provas',
  [ENTITIES.CUSTO_LOGISTICO]: 'custo_logistico',
  [ENTITIES.CUSTO_RIBEIRAO]: 'custo_ribeirao_preto',
  [ENTITIES.CUSTO_FRANCA]: 'custo_franca',
  [ENTITIES.RECEIVEIS_RIBEIRAO]: 'recebiveis_ribeirao_preto',
  [ENTITIES.RECEIVEIS_FRANCA]: 'recebiveis_franca',
  [ENTITIES.SOCIO_LIMEIRA]: 'socio_limeira',
  [ENTITIES.VENDA_ANILHA]: 'venda_anilha',
  [ENTITIES.CONFIGURACAO]: 'configuracao',
};

// Unified data service - uses Supabase when configured, localStorage otherwise
export const dataService = {
  async list(collection) {
    if (!isSupabaseConfigured()) {
      return localDb.list(collection);
    }
    const table = TABLE_MAP[collection];
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    if (error) {
      console.error(`Error listing ${table}:`, error);
      return localDb.list(collection); // fallback
    }
    return data || [];
  },

  async create(collection, item) {
    if (!isSupabaseConfigured()) {
      return localDb.create(collection, item);
    }
    const table = TABLE_MAP[collection];
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from(table).insert([{ ...item, user_id: user?.id }]).select().single();
    if (error) {
      console.error(`Error creating ${table}:`, error);
      return localDb.create(collection, item); // fallback
    }
    return data;
  },

  async update(collection, id, item) {
    if (!isSupabaseConfigured()) {
      return localDb.update(collection, id, item);
    }
    const table = TABLE_MAP[collection];
    const { data, error } = await supabase.from(table).update(item).eq('id', id).select().single();
    if (error) {
      console.error(`Error updating ${table}:`, error);
      return localDb.update(collection, id, item); // fallback
    }
    return data;
  },

  async delete(collection, id) {
    if (!isSupabaseConfigured()) {
      return localDb.delete(collection, id);
    }
    const table = TABLE_MAP[collection];
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
      console.error(`Error deleting ${table}:`, error);
      return localDb.delete(collection, id); // fallback
    }
  },
};

// Auth helpers
export const authService = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  onAuthChange(callback) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session);
    });
  },
};

export { ENTITIES, formatCurrency, formatDate };
