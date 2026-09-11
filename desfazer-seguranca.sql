-- ============================================================
-- COLOMBUS 2025 — DESFAZER A SEGURANÇA (voltar a funcionar SEM login)
-- Use apenas se quiser tirar o login e voltar como era antes.
-- Como usar:
--   1. Abra: https://supabase.com/dashboard/project/cmoaiyhwmrsaihibfhux/sql/new
--   2. Cole TODO este conteúdo e clique em RUN.
-- ============================================================

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
