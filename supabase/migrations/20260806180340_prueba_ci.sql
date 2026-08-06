-- Migración de prueba: verifica el pipeline de CI. Se borra en la siguiente.
create table if not exists public.ci_smoke_test (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);
