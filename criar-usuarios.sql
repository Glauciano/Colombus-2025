-- ============================================================
-- COLOMBUS 2025 — ACERTAR OS 2 USUÁRIOS (pode rodar de novo sem erro)
-- O que faz:
--   * Se o email já existe: só acerta a senha para "colombus2027" e confirma o email.
--   * Se o email NÃO existe: cria com a senha "colombus2027".
-- Como usar:
--   1. Abra: https://supabase.com/dashboard/project/cmoaiyhwmrsaihibfhux/sql/new
--   2. Cole TODO este conteúdo e clique em RUN.
--   3. Entre no app com:
--        glaucianosilva@gmail.com   senha: colombus2027
--        psppastore@hotmail.com     senha: colombus2027
-- ============================================================

-- 1) Se já existir, acerta a senha e confirma o email
update auth.users
set encrypted_password = crypt('colombus2027', gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now()
where email = 'glaucianosilva@gmail.com';

update auth.users
set encrypted_password = crypt('colombus2027', gen_salt('bf')),
    email_confirmed_at = now(),
    updated_at = now()
where email = 'psppastore@hotmail.com';

-- 2) Se NÃO existir, cria (não duplica quem já existe)
insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  'glaucianosilva@gmail.com', crypt('colombus2027', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now()
where not exists (select 1 from auth.users where email = 'glaucianosilva@gmail.com');

insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
  'psppastore@hotmail.com', crypt('colombus2027', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}', '{}', now(), now()
where not exists (select 1 from auth.users where email = 'psppastore@hotmail.com');

-- 3) Garante o vínculo de identidade (para o login funcionar)
insert into auth.identities (provider_id, id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
select u.id::text, u.id, u.id, jsonb_build_object('sub', u.id::text, 'email', u.email), 'email', now(), now(), now()
from auth.users u
where u.email in ('glaucianosilva@gmail.com', 'psppastore@hotmail.com')
  and not exists (select 1 from auth.identities i where i.user_id = u.id);
