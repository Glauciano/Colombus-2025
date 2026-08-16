// Smart data layer: uses Supabase REST API directly for full control
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_PREFIX = 'colombus_';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://cmoaiyhwmrsaihibfhux.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_AUHiIr1CvseO8Uy-XtqFyw_L3ELN2-4';

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

// --- Direct Supabase REST API calls (bypasses JS client auth issues) ---
const supabaseHeaders = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
};

async function supabaseRest(method, table, body = null, query = '') {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? '?' + query : ''}`;
  const options = {
    method,
    headers: { ...supabaseHeaders },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorBody = await response.text();
    let errorObj;
    try { errorObj = JSON.parse(errorBody); } catch { errorObj = { message: errorBody }; }
    console.error(`[Supabase REST] ${method} ${table} ERROR ${response.status}:`, errorObj);
    const err = new Error(errorObj.message || `Supabase error ${response.status}`);
    err.code = errorObj.code;
    err.details = errorObj.details;
    err.hint = errorObj.hint;
    err.status = response.status;
    throw err;
  }
  
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
}

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

// Clean values for Supabase:
// - Empty strings → null (fixes "invalid input syntax" for DATE/INTEGER)
// - NaN numbers → null
function cleanForSupabase(obj) {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === '') {
      result[key] = null;
    } else if (typeof value === 'number' && isNaN(value)) {
      result[key] = null;
    } else {
      result[key] = value;
    }
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
  // Clean internal fields that should not be sent to Supabase
  delete result.createdAt;
  delete result.updatedAt;
  delete result.created_at;
  delete result.user_id;
  delete result.id;
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

// --- Smart db: Supabase REST when enabled, localStorage fallback ---
export const db = {
  async list(collection) {
    if (!isSupabaseConfigured()) {
      return localDb.list(collection);
    }
    const table = TABLE_MAP[collection];
    if (!table) return localDb.list(collection);
    
    try {
      const data = await supabaseRest('GET', table, null, 'select=*&order=created_at.desc');
      return (data || []).map(item => fromSupabase(item, collection));
    } catch (err) {
      console.error(`Supabase list error (${collection}):`, err.message);
      // For list, fall back to localStorage so the page isn't empty
      return localDb.list(collection);
    }
  },

  async create(collection, itemData) {
    if (!isSupabaseConfigured()) {
      return localDb.create(collection, itemData);
    }
    const table = TABLE_MAP[collection];
    if (!table) return localDb.create(collection, itemData);
    
    const supItem = toSupabase(itemData, collection);
    console.log(`[db] CREATE ${collection}:`, JSON.stringify(supItem));
    
    const data = await supabaseRest('POST', table, supItem, 'select=*');
    const result = Array.isArray(data) ? data[0] : data;
    console.log(`[db] CREATE ${collection} OK:`, result);
    return fromSupabase(result, collection);
  },

  async update(collection, id, itemData) {
    if (!isSupabaseConfigured()) {
      return localDb.update(collection, id, itemData);
    }
    const table = TABLE_MAP[collection];
    if (!table) return localDb.update(collection, id, itemData);
    
    const supItem = toSupabase(itemData, collection);
    console.log(`[db] UPDATE ${collection} ${id}:`, JSON.stringify(supItem));
    
    const data = await supabaseRest('PATCH', table, supItem, `id=eq.${id}&select=*`);
    const result = Array.isArray(data) ? data[0] : data;
    console.log(`[db] UPDATE ${collection} OK:`, result);
    return fromSupabase(result, collection);
  },

  async delete(collection, id) {
    if (!isSupabaseConfigured()) {
      return localDb.delete(collection, id);
    }
    const table = TABLE_MAP[collection];
    if (!table) return localDb.delete(collection, id);
    
    console.log(`[db] DELETE ${collection} ${id}`);
    await supabaseRest('DELETE', table, null, `id=eq.${id}`);
    console.log(`[db] DELETE ${collection} OK`);
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
