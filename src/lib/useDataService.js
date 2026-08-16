import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { db as localDb } from './db';

// Map local entity keys to Supabase table names
const TABLE_MAP = {
  'provas': 'provas',
  'custo_logistico': 'custo_logistico',
  'custo_ribeirao': 'custo_ribeirao_preto',
  'custo_franca': 'custo_franca',
  'receiveis_ribeirao': 'recebiveis_ribeirao_preto',
  'receiveis_franca': 'recebiveis_franca',
  'socio_limeira': 'socio_limeira',
  'venda_anilha': 'venda_anilha',
  'configuracao': 'configuracao',
};

// Field mapping: local field name → Supabase field name
const FIELD_MAPS = {
  'custo_logistico': { 'cidade': 'cidade' }, // custo_logistico uses cidade
  'custo_ribeirao': { 'cidade': 'descricao' }, // custo_ribeirao uses descricao
  'custo_franca': { 'cidade': 'descricao' }, // custo_franca uses descricao
};

// Hook that provides real-time data from Supabase (or localStorage fallback)
export function useData(collection) {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    if (!isSupabaseConfigured()) {
      // Fallback to localStorage
      const localData = localDb.list(collection);
      setData(localData);
      setIsOnline(false);
      setIsLoading(false);
      return;
    }

    const table = TABLE_MAP[collection];
    if (!table) {
      const localData = localDb.list(collection);
      setData(localData);
      setIsOnline(false);
      setIsLoading(false);
      return;
    }

    try {
      const { data: remoteData, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: false, nullsFirst: false });
      
      if (error) throw error;
      
      // Transform Supabase data to match local format
      const transformed = (remoteData || []).map(item => transformFromSupabase(item, collection));
      setData(transformed);
      setIsOnline(true);
    } catch (err) {
      console.error(`Error fetching ${collection}:`, err);
      // Fallback to localStorage
      const localData = localDb.list(collection);
      setData(localData);
      setIsOnline(false);
    }
    
    setIsLoading(false);
  }, [collection]);

  useEffect(() => {
    fetchData();

    // Set up real-time subscription
    if (isSupabaseConfigured()) {
      const table = TABLE_MAP[collection];
      if (table) {
        const channel = supabase
          .channel(`${collection}-changes`)
          .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
            fetchData();
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [collection, fetchData]);

  const create = async (item) => {
    const supabaseItem = transformToSupabase(item, collection);
    
    if (isSupabaseConfigured()) {
      const table = TABLE_MAP[collection];
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from(table)
        .insert([{ ...supabaseItem, user_id: user?.id }])
        .select()
        .single();
      
      if (error) throw error;
      await fetchData();
      return transformFromSupabase(data, collection);
    }
    
    const result = localDb.create(collection, item);
    await fetchData();
    return result;
  };

  const update = async (id, item) => {
    const supabaseItem = transformToSupabase(item, collection);
    // Remove fields that shouldn't be sent in update
    delete supabaseItem.id;
    delete supabaseItem.created_at;
    delete supabaseItem.user_id;
    
    if (isSupabaseConfigured()) {
      const table = TABLE_MAP[collection];
      const { data, error } = await supabase
        .from(table)
        .update(supabaseItem)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      await fetchData();
      return transformFromSupabase(data, collection);
    }
    
    const result = localDb.update(collection, id, item);
    await fetchData();
    return result;
  };

  const remove = async (id) => {
    if (isSupabaseConfigured()) {
      const table = TABLE_MAP[collection];
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      await fetchData();
      return;
    }
    
    localDb.delete(collection, id);
    await fetchData();
  };

  return { data, isLoading, isOnline, create, update, remove, refresh: fetchData };
}

// Transform local data format to Supabase format
function transformToSupabase(item, collection) {
  const result = { ...item };
  
  // Handle custo_ribeirao and custo_franca: they use 'descricao' instead of 'cidade'
  if ((collection === 'custo_ribeirao' || collection === 'custo_franca') && item.cidade && !item.descricao) {
    result.descricao = item.cidade;
    delete result.cidade;
  }
  
  // Remove local-only fields
  delete result.createdAt;
  delete result.updatedAt;
  
  return result;
}

// Transform Supabase format to local data format
function transformFromSupabase(item, collection) {
  const result = { ...item };
  
  // Handle custo_ribeirao and custo_franca: map descricao back to cidade
  if ((collection === 'custo_ribeirao' || collection === 'custo_franca') && item.descricao && !item.cidade) {
    result.cidade = item.descricao;
  }
  
  return result;
}

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
