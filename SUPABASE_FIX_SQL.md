# SQL para corrigir o Supabase

Cole este SQL no **SQL Editor** do Supabase e execute.

## Passo 1: Adicionar colunas faltantes

```sql
-- Adicionar colunas faltantes na tabela configuracao
ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS valor_numero NUMERIC(10,2) DEFAULT 0;
ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS valor_texto TEXT;

-- Adicionar data_pagamento nas tabelas de recebíveis
ALTER TABLE recebiveis_ribeirao_preto ADD COLUMN IF NOT EXISTS data_pagamento DATE;
ALTER TABLE recebiveis_franca ADD COLUMN IF NOT EXISTS data_pagamento DATE;

-- Adicionar coluna descricao nas tabelas de custo (para compatibilidade com dados do Base44)
ALTER TABLE custo_ribeirao_preto ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE custo_franca ADD COLUMN IF NOT EXISTS descricao TEXT;

-- Adicionar observacao nas tabelas de recebíveis
ALTER TABLE recebiveis_ribeirao_preto ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE recebiveis_franca ADD COLUMN IF NOT EXISTS observacao TEXT;
```

## Passo 2: Desabilitar RLS (app pessoal, 1 usuário)

```sql
-- Desabilitar RLS para acesso com anon key (app de uso pessoal)
ALTER TABLE provas DISABLE ROW LEVEL SECURITY;
ALTER TABLE custo_logistico DISABLE ROW LEVEL SECURITY;
ALTER TABLE custo_ribeirao_preto DISABLE ROW LEVEL SECURITY;
ALTER TABLE custo_franca DISABLE ROW LEVEL SECURITY;
ALTER TABLE recebiveis_ribeirao_preto DISABLE ROW LEVEL SECURITY;
ALTER TABLE recebiveis_franca DISABLE ROW LEVEL SECURITY;
ALTER TABLE socio_limeira DISABLE ROW LEVEL SECURITY;
ALTER TABLE venda_anilha DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao DISABLE ROW LEVEL SECURITY;

-- Remover policies antigas (se existirem)
DROP POLICY IF EXISTS "Users can manage their own data" ON provas;
DROP POLICY IF EXISTS "Users can manage their own data" ON custo_logistico;
DROP POLICY IF EXISTS "Users can manage their own data" ON custo_ribeirao_preto;
DROP POLICY IF EXISTS "Users can manage their own data" ON custo_franca;
DROP POLICY IF EXISTS "Users can manage their own data" ON recebiveis_ribeirao_preto;
DROP POLICY IF EXISTS "Users can manage their own data" ON recebiveis_franca;
DROP POLICY IF EXISTS "Users can manage their own data" ON socio_limeira;
DROP POLICY IF EXISTS "Users can manage their own data" ON venda_anilha;
DROP POLICY IF EXISTS "Users can manage their own data" ON configuracao;
```

## SQL Completo (copie tudo de uma vez)

```sql
-- === CORREÇÃO COMPLETA DO SUPABASE ===

-- 1. Adicionar colunas faltantes
ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS valor_numero NUMERIC(10,2) DEFAULT 0;
ALTER TABLE configuracao ADD COLUMN IF NOT EXISTS valor_texto TEXT;
ALTER TABLE recebiveis_ribeirao_preto ADD COLUMN IF NOT EXISTS data_pagamento DATE;
ALTER TABLE recebiveis_franca ADD COLUMN IF NOT EXISTS data_pagamento DATE;
ALTER TABLE custo_ribeirao_preto ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE custo_franca ADD COLUMN IF NOT EXISTS descricao TEXT;
ALTER TABLE recebiveis_ribeirao_preto ADD COLUMN IF NOT EXISTS observacao TEXT;
ALTER TABLE recebiveis_franca ADD COLUMN IF NOT EXISTS observacao TEXT;

-- 2. Desabilitar RLS (app pessoal)
ALTER TABLE provas DISABLE ROW LEVEL SECURITY;
ALTER TABLE custo_logistico DISABLE ROW LEVEL SECURITY;
ALTER TABLE custo_ribeirao_preto DISABLE ROW LEVEL SECURITY;
ALTER TABLE custo_franca DISABLE ROW LEVEL SECURITY;
ALTER TABLE recebiveis_ribeirao_preto DISABLE ROW LEVEL SECURITY;
ALTER TABLE recebiveis_franca DISABLE ROW LEVEL SECURITY;
ALTER TABLE socio_limeira DISABLE ROW LEVEL SECURITY;
ALTER TABLE venda_anilha DISABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao DISABLE ROW LEVEL SECURITY;

-- 3. Remover policies antigas
DROP POLICY IF EXISTS "Users can manage their own data" ON provas;
DROP POLICY IF EXISTS "Users can manage their own data" ON custo_logistico;
DROP POLICY IF EXISTS "Users can manage their own data" ON custo_ribeirao_preto;
DROP POLICY IF EXISTS "Users can manage their own data" ON custo_franca;
DROP POLICY IF EXISTS "Users can manage their own data" ON recebiveis_ribeirao_preto;
DROP POLICY IF EXISTS "Users can manage their own data" ON recebiveis_franca;
DROP POLICY IF EXISTS "Users can manage their own data" ON socio_limeira;
DROP POLICY IF EXISTS "Users can manage their own data" ON venda_anilha;
DROP POLICY IF EXISTS "Users can manage their own data" ON configuracao;
```

Após executar este SQL, volte ao app e clique em **"Ativar Supabase"** na página de Importar Dados.
