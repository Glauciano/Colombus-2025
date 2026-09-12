-- ============================================================
-- COLOMBUS 2025 — CORREÇÕES (rodar UMA vez)
--   1. Cria os campos de HORA usados apenas pelo Itinerário
--      (o calendário continua igual, com seus campos de dia).
--   2. Desliga a segurança (RLS) para o app voltar a funcionar
--      sem login, como era antes.
-- Como usar:
--   1. Abra: https://supabase.com/dashboard/project/cmoaiyhwmrsaihibfhux/sql/new
--   2. Cole TODO este conteúdo e clique em RUN.
-- ============================================================

-- 1) Novos campos de hora (somente do Itinerário)
ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS hora_embarque text;
ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS hora_solta text;

-- 2) Desliga a segurança (voltar a funcionar sem login)
DROP POLICY IF EXISTS acesso_autorizado ON public.provas;
DROP POLICY IF EXISTS acesso_autorizado ON public.custo_logistico;
DROP POLICY IF EXISTS acesso_autorizado ON public.custo_ribeirao_preto;
DROP POLICY IF EXISTS acesso_autorizado ON public.custo_franca;
DROP POLICY IF EXISTS acesso_autorizado ON public.recebiveis_ribeirao_preto;
DROP POLICY IF EXISTS acesso_autorizado ON public.recebiveis_franca;
DROP POLICY IF EXISTS acesso_autorizado ON public.socio_limeira;
DROP POLICY IF EXISTS acesso_autorizado ON public.venda_anilha;
DROP POLICY IF EXISTS acesso_autorizado ON public.configuracao;

ALTER TABLE public.provas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.custo_logistico DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.custo_ribeirao_preto DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.custo_franca DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recebiveis_ribeirao_preto DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recebiveis_franca DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.socio_limeira DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.venda_anilha DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracao DISABLE ROW LEVEL SECURITY;
