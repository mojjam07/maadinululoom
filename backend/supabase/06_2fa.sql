-- Two-factor authentication storage (server-managed)
create table if not exists public.two_factor_secrets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  secret_encrypted text not null,
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists two_factor_user_idx on public.two_factor_secrets(user_id);

-- RLS: allow admin/service-role to manage; users cannot read/write these rows directly
alter table public.two_factor_secrets enable row level security;

drop policy if exists "two_factor_admin_only" on public.two_factor_secrets;
create policy "two_factor_admin_only" on public.two_factor_secrets
  for all using (auth.role() = 'authenticated' and false) with check (auth.role() = 'authenticated' and false);

-- Note: Admin/service role operations should be performed via backend service role client.
