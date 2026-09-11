-- ============================================================
-- COLOMBUS 2025 — SEGURANÇA (LOGIN + RLS)
-- Como usar:
--   1. Abra: https://supabase.com/dashboard/project/cmoaiyhwmrsaihibfhux/sql/new
--   2. Cole TODO este conteúdo no editor.
--   3. Clique em RUN.
-- ============================================================

-- 1) Ativa a segurança (RLS) em todas as tabelas do app
ALTER TABLE public.provas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custo_logistico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custo_ribeirao_preto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custo_franca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recebiveis_ribeirao_preto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recebiveis_franca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.socio_limeira ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venda_anilha ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracao ENABLE ROW LEVEL SECURITY;

-- 2) Regra de acesso: somente os emails abaixo podem ver, editar e apagar
--    (emails liberados: glaucianosilva@gmail.com e psppastore@hotmail.com)

DROP POLICY IF EXISTS acesso_autorizado ON public.provas;
CREATE POLICY acesso_autorizado ON public.provas FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'));

DROP POLICY IF EXISTS acesso_autorizado ON public.custo_logistico;
CREATE POLICY acesso_autorizado ON public.custo_logistico FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'));

DROP POLICY IF EXISTS acesso_autorizado ON public.custo_ribeirao_preto;
CREATE POLICY acesso_autorizado ON public.custo_ribeirao_preto FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'));

DROP POLICY IF EXISTS acesso_autorizado ON public.custo_franca;
CREATE POLICY acesso_autorizado ON public.custo_franca FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'));

DROP POLICY IF EXISTS acesso_autorizado ON public.recebiveis_ribeirao_preto;
CREATE POLICY acesso_autorizado ON public.recebiveis_ribeirao_preto FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'));

DROP POLICY IF EXISTS acesso_autorizado ON public.recebiveis_franca;
CREATE POLICY acesso_autorizado ON public.recebiveis_franca FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'));

DROP POLICY IF EXISTS acesso_autorizado ON public.socio_limeira;
CREATE POLICY acesso_autorizado ON public.socio_limeira FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'));

DROP POLICY IF EXISTS acesso_autorizado ON public.venda_anilha;
CREATE POLICY acesso_autorizado ON public.venda_anilha FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'));

DROP POLICY IF EXISTS acesso_autorizado ON public.configuracao;
CREATE POLICY acesso_autorizado ON public.configuracao FOR ALL TO authenticated
  USING (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'))
  WITH CHECK (auth.jwt() ->> 'email' IN ('glaucianosilva@gmail.com', 'psppastore@hotmail.com'));
