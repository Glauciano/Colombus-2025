import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project credentials
// Get them from: https://supabase.com/dashboard → Your Project → Settings → API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://YOUR_PROJECT_ID.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_ANON_KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !SUPABASE_URL.includes('YOUR_PROJECT_ID') && !SUPABASE_ANON_KEY.includes('YOUR_ANON_KEY');
};

// ─── SQL to run in Supabase SQL Editor ───
// Copy and paste this into Supabase → SQL Editor → New Query
export const SETUP_SQL = `
-- Provas (competições de pombos-correio)
CREATE TABLE IF NOT EXISTS provas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cidade TEXT,
  km INTEGER,
  categoria TEXT DEFAULT 'Copa Filhotes',
  data_embarque DATE,
  dia_embarque TEXT,
  data_solta DATE,
  dia_solta TEXT,
  valor NUMERIC(10,2),
  status TEXT DEFAULT 'Programada',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Custo Logístico (geral)
CREATE TABLE IF NOT EXISTS custo_logistico (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cidade TEXT,
  km INTEGER,
  combustivel NUMERIC(10,2) DEFAULT 0,
  pedagio NUMERIC(10,2) DEFAULT 0,
  motorista NUMERIC(10,2) DEFAULT 0,
  gta_ajudante NUMERIC(10,2) DEFAULT 0,
  seguro_caminhao NUMERIC(10,2) DEFAULT 0,
  custo_manutencoes NUMERIC(10,2) DEFAULT 0,
  total_gastos NUMERIC(10,2) DEFAULT 0,
  custo_total NUMERIC(10,2) DEFAULT 0,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Custo Ribeirão Preto
CREATE TABLE IF NOT EXISTS custo_ribeirao_preto (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cidade TEXT,
  km INTEGER,
  combustivel NUMERIC(10,2) DEFAULT 0,
  pedagio NUMERIC(10,2) DEFAULT 0,
  motorista NUMERIC(10,2) DEFAULT 0,
  gta_ajudante NUMERIC(10,2) DEFAULT 0,
  seguro_caminhao NUMERIC(10,2) DEFAULT 0,
  custo_manutencoes NUMERIC(10,2) DEFAULT 0,
  total_gastos NUMERIC(10,2) DEFAULT 0,
  custo_total NUMERIC(10,2) DEFAULT 0,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Custo Franca
CREATE TABLE IF NOT EXISTS custo_franca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cidade TEXT,
  km INTEGER,
  combustivel NUMERIC(10,2) DEFAULT 0,
  pedagio NUMERIC(10,2) DEFAULT 0,
  motorista NUMERIC(10,2) DEFAULT 0,
  gta_ajudante NUMERIC(10,2) DEFAULT 0,
  seguro_caminhao NUMERIC(10,2) DEFAULT 0,
  custo_manutencoes NUMERIC(10,2) DEFAULT 0,
  total_gastos NUMERIC(10,2) DEFAULT 0,
  custo_total NUMERIC(10,2) DEFAULT 0,
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Recebíveis Ribeirão Preto
CREATE TABLE IF NOT EXISTS recebiveis_ribeirao_preto (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT,
  valor NUMERIC(10,2) DEFAULT 0,
  data_vencimento DATE,
  status TEXT DEFAULT 'Pendente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Recebíveis Franca
CREATE TABLE IF NOT EXISTS recebiveis_franca (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao TEXT,
  valor NUMERIC(10,2) DEFAULT 0,
  data_vencimento DATE,
  status TEXT DEFAULT 'Pendente',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Sócios Limeira (com parcelas)
CREATE TABLE IF NOT EXISTS socio_limeira (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT,
  telefone TEXT,
  email TEXT,
  observacao TEXT,
  parcela_1 NUMERIC(10,2) DEFAULT 0, data_parcela_1 DATE, pago_parcela_1 BOOLEAN DEFAULT FALSE,
  parcela_2 NUMERIC(10,2) DEFAULT 0, data_parcela_2 DATE, pago_parcela_2 BOOLEAN DEFAULT FALSE,
  parcela_3 NUMERIC(10,2) DEFAULT 0, data_parcela_3 DATE, pago_parcela_3 BOOLEAN DEFAULT FALSE,
  parcela_4 NUMERIC(10,2) DEFAULT 0, data_parcela_4 DATE, pago_parcela_4 BOOLEAN DEFAULT FALSE,
  parcela_5 NUMERIC(10,2) DEFAULT 0, data_parcela_5 DATE, pago_parcela_5 BOOLEAN DEFAULT FALSE,
  parcela_6 NUMERIC(10,2) DEFAULT 0, data_parcela_6 DATE, pago_parcela_6 BOOLEAN DEFAULT FALSE,
  parcela_7 NUMERIC(10,2) DEFAULT 0, data_parcela_7 DATE, pago_parcela_7 BOOLEAN DEFAULT FALSE,
  parcela_8 NUMERIC(10,2) DEFAULT 0, data_parcela_8 DATE, pago_parcela_8 BOOLEAN DEFAULT FALSE,
  parcela_9 NUMERIC(10,2) DEFAULT 0, data_parcela_9 DATE, pago_parcela_9 BOOLEAN DEFAULT FALSE,
  parcela_10 NUMERIC(10,2) DEFAULT 0, data_parcela_10 DATE, pago_parcela_10 BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Venda de Anilhas
CREATE TABLE IF NOT EXISTS venda_anilha (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  socio TEXT,
  numero_inicio INTEGER,
  numero_fim INTEGER,
  ano INTEGER,
  valor_unitario NUMERIC(10,2) DEFAULT 0,
  valor_total NUMERIC(10,2) DEFAULT 0,
  data_venda DATE,
  status TEXT DEFAULT 'Disponível',
  observacao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Configuração
CREATE TABLE IF NOT EXISTS configuracao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT,
  valor TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security on all tables
ALTER TABLE provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE custo_logistico ENABLE ROW LEVEL SECURITY;
ALTER TABLE custo_ribeirao_preto ENABLE ROW LEVEL SECURITY;
ALTER TABLE custo_franca ENABLE ROW LEVEL SECURITY;
ALTER TABLE recebiveis_ribeirao_preto ENABLE ROW LEVEL SECURITY;
ALTER TABLE recebiveis_franca ENABLE ROW LEVEL SECURITY;
ALTER TABLE socio_limeira ENABLE ROW LEVEL SECURITY;
ALTER TABLE venda_anilha ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao ENABLE ROW LEVEL SECURITY;

-- Policies: users can only see their own data
CREATE POLICY "Users can manage their own data" ON provas FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON custo_logistico FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON custo_ribeirao_preto FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON custo_franca FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON recebiveis_ribeirao_preto FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON recebiveis_franca FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON socio_limeira FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON venda_anilha FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own data" ON configuracao FOR ALL USING (auth.uid() = user_id);
`;
