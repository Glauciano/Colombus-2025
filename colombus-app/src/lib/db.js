// Generic localStorage-based CRUD store
const STORAGE_PREFIX = 'colombus_';

function getKey(collection) {
  return STORAGE_PREFIX + collection;
}

function getAll(collection) {
  const data = localStorage.getItem(getKey(collection));
  return data ? JSON.parse(data) : [];
}

function saveAll(collection, items) {
  localStorage.setItem(getKey(collection), JSON.stringify(items));
}

export const db = {
  list(collection) {
    return getAll(collection);
  },
  
  get(collection, id) {
    return getAll(collection).find(item => item.id === id) || null;
  },
  
  create(collection, data) {
    const items = getAll(collection);
    const item = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    items.push(item);
    saveAll(collection, items);
    return item;
  },
  
  update(collection, id, data) {
    const items = getAll(collection);
    const index = items.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');
    items[index] = { ...items[index], ...data, updatedAt: new Date().toISOString() };
    saveAll(collection, items);
    return items[index];
  },
  
  delete(collection, id) {
    const items = getAll(collection);
    saveAll(collection, items.filter(item => item.id !== id));
  }
};

// Entity names matching the original app
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

// Helper to format currency
export function formatCurrency(value) {
  return (value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

// Helper to format date
export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return dateStr.slice(0, 10).split('-').reverse().join('/');
}
