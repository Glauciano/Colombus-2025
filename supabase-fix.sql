-- ============================================
-- COLOMBUS 2025 - SQL DE CORREÇÃO DO SUPABASE
-- Cole TUDO no SQL Editor e clique RUN
-- ============================================

-- 1) Adicionar colunas faltantes na tabela configuracao
ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS valor_numero NUMERIC(10,2) DEFAULT 0;
ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS valor_texto TEXT;

-- 2) Adicionar data_pagamento nas tabelas de recebíveis
ALTER TABLE recebiveis_ribeirao_preto ADD COLUMN IF NOT EXISTS data_pagamento DATE;
ALTER TABLE recebiveis_franca ADD COLUMN IF NOT EXISTS data_pagamento DATE;

-- 3) Adicionar descricao nas tabelas de custo (compatibilidade)
ALTER TABLE custo_ribeirao_preto ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE custo_franca ADD COLUMN IF NOT EXISTS descricao TEXT;

-- 4) Adicionar observacao nas tabelas de recebíveis
ALTER TABLE recebiveis_ribeirao_preto ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE recebiveis_franca ADD COLUMN IF NOT EXISTS observacao TEXT;

-- 5) Desabilitar RLS em TODAS as tabelas (app pessoal, 1 usuário)
ALTER TABLE provas DISABLE ROW LEVEL SECURITY;
ALTER TABLE custo_logistico DISABLE ROW LEVEL SECURITY;
ALTER TABLE custo_ribeirao_preto DISABLE ROW LEVEL SECURITY;
ALTER TABLE custo_franca DISABLE ROW LEVEL SECURITY;
ALTER TABLE recebiveis_ribeirao_preto DISABLE ROW LEVEL SECURITY;
ALTER TABLE recebiveis_franca DISABLE ROW LEVEL SECURITY;
ALTER TABLE socio_limeira DISABLE ROW LEVEL SECURITY;
ALTER TABLE venda_anilha DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao DISABLE ROW LEVEL SECURITY;

-- 6) Remover policies antigas (que bloqueavam acesso)
DROP POLICY IF EXISTS "Users can manage their own data" ON provas;
DROP POLICY IF EXISTS "Users can manage their own data" ON custo_logistico;
DROP POLICY IF EXISTS "Users can manage their own data" ON custo_ribeirao_preto;
DROP POLICY IF EXISTS "Users can manage their own data" ON custo_franca;
DROP POLICY IF EXISTS "Users can manage their own data" ON recebiveis_ribeirao_preto;
DROP POLICY IF EXISTS "Users can manage their own data" ON recebiveis_franca;
DROP POLICY IF EXISTS "Users can manage their own data" ON socio_limeira;
DROP POLICY IF EXISTS "Users can manage their own data" ON venda_anilha;
DROP POLICY IF EXISTS "Users can manage their own data" ON configuracao;
