create table if not exists public.play_sessions (
 id uuid primary key,
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 payload jsonb not null check (jsonb_typeof(payload) = 'object'),
 updated_at timestamptz not null default now()
);
alter table public.play_sessions enable row level security;
revoke all on public.play_sessions from anon;
grant select, insert, update, delete on public.play_sessions to authenticated;
create policy "Read own sessions" on public.play_sessions for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Insert own sessions" on public.play_sessions for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Update own sessions" on public.play_sessions for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Delete own sessions" on public.play_sessions for delete to authenticated using ((select auth.uid()) = owner_id);
