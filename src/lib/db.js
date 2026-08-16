// Smart data layer: uses Supabase when explicitly enabled, localStorage otherwise
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_PREFIX = 'colombus_';

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

// --- localStorage CRUD ---
function getKey(collection) {
  return STORAGE_PREFIX + collection;
}

function localGetAll(collection) {
  const data = localStorage.getItem(getKey(collection));
  return data ? JSON.parse(data) : [];
}

function localSaveAll(collection, items) {
  localStorage.setItem(getKey(collection), JSON.stringify(items));
}

export const localDb = {
  list(collection) { return localGetAll(collection); },
  get(collection, id) { return localGetAll(collection).find(item => item.id === id) || null; },
  create(collection, data) {
    const items = localGetAll(collection);
    const item = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    items.push(item);
    localSaveAll(collection, items);
    return item;
  },
  update(collection, id, data) {
    const items = localGetAll(collection);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
    localSaveAll(collection, items);
    return items[index];
  },
  delete(collection, id) {
    const items = localGetAll(collection);
    localSaveAll(collection, items.filter(item => item.id !== id));
  }
};

// --- Supabase field transforms ---
// custo_ribeirao and custo_franca seed data uses 'descricao' for city name,
// but Supabase tables use 'cidade'. We transform on the way in/out.
// Clean empty strings → null for Supabase
// (empty strings cause "invalid input syntax" errors for DATE and INTEGER columns)
function cleanForSupabase(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = (value === '') ? null : value;
  }
  return result;
}

function toSupabase(item, collection) {
  const result = { ...item };
  // Map descricao -> cidade for Supabase tables that have cidade column
  if ((collection === 'custo_ribeirao' || collection === 'custo_franca') && result.descricao && !result.cidade) {
    result.cidade = result.descricao;
    delete result.descricao;
  }
  // Clean internal fields
  delete result.createdAt;
  delete result.updatedAt;
  delete result.created_at;
  // Convert empty strings to null (fixes DATE/INTEGER errors in Supabase)
  return cleanForSupabase(result);
}

function fromSupabase(item, collection) {
  if (!item) return item;
  const result = { ...item };
  // Map cidade -> descricao for local compatibility (seed data uses descricao)
  if ((collection === 'custo_ribeirao' || collection === 'custo_franca') && result.cidade && !result.descricao) {
    result.descricao = result.cidade;
  }
  return result;
}

// --- Smart db: Supabase when enabled, localStorage fallback ---
export const db = {
  async list(collection) {
    if (!isSupabaseConfigured()) {
      return localDb.list(collection);
    }
    const table = TABLE_MAP[collection];
    if (!table) return localDb.list(collection);
    
    try {
      if (!supabase) throw new Error('Supabase not initialized');
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data || []).map(item => fromSupabase(item, collection));
    } catch (err) {
      console.error(`Supabase list error (${collection}):`, err);
      return localDb.list(collection);
    }
  },

  async create(collection, itemData) {
    if (!isSupabaseConfigured()) {
      return localDb.create(collection, itemData);
    }
    const table = TABLE_MAP[collection];
    if (!table) return localDb.create(collection, itemData);
    
    try {
      if (!supabase) throw new Error('Supabase not initialized');
      const supItem = toSupabase(itemData, collection);
      delete supItem.id;
      const { data, error } = await supabase.from(table).insert([supItem]).select().single();
      if (error) throw error;
      return fromSupabase(data, collection);
    } catch (err) {
      console.error(`Supabase create error (${collection}):`, err);
      return localDb.create(collection, itemData);
    }
  },

  async update(collection, id, itemData) {
    if (!isSupabaseConfigured()) {
      return localDb.update(collection, id, itemData);
    }
    const table = TABLE_MAP[collection];
    if (!table) return localDb.update(collection, id, itemData);
    
    try {
      if (!supabase) throw new Error('Supabase not initialized');
      const supItem = toSupabase(itemData, collection);
      delete supItem.id;
      delete supItem.created_at;
      delete supItem.user_id;
      const { data, error } = await supabase.from(table).update(supItem).eq('id', id).select().single();
      if (error) throw error;
      return fromSupabase(data, collection);
    } catch (err) {
      console.error(`Supabase update error (${collection}):`, err);
      return localDb.update(collection, id, itemData);
    }
  },

  async delete(collection, id) {
    if (!isSupabaseConfigured()) {
      return localDb.delete(collection, id);
    }
    const table = TABLE_MAP[collection];
    if (!table) return localDb.delete(collection, id);
    
    try {
      if (!supabase) throw new Error('Supabase not initialized');
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error(`Supabase delete error (${collection}):`, err);
      localDb.delete(collection, id);
    }
  }
};

// Entity names
export const ENTITIES = {
  PROVA: 'provas',
  CUSTO_LOGISTICO: 'custo_logistico',
  CUSTO_RIBEIRAO: 'custo_ribeirao',
  CUSTO_FRANCA: 'custo_franca',
  RECEIVEIS_RIBEIRAO: 'receiveis_ribeirao',
  RECEIVEIS_FRANCA: 'receiveis_franca',
  SOCIO_LIMEIRA: 'socio_limeira',
  VENDA_ANILHA: 'venda_anilha',
  CONFIGURACAO: 'configuracao'
};

// Helpers
export function formatCurrency(value) {
  return (value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return dateStr.slice(0, 10).split('-').reverse().join('/');
}
