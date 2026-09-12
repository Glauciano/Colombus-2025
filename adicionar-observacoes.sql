-- ============================================================
-- COLOMBUS 2025 — ADICIONAR CAMPO "OBSERVAÇÕES" NA PROVA
-- Como usar:
--   1. Abra: https://supabase.com/dashboard/project/cmoaiyhwmrsaihibfhux/sql/new
--   2. Cole esta linha abaixo e clique em RUN.
-- ============================================================

ALTER TABLE public.provas ADD COLUMN IF NOT EXISTS observacoes text;
