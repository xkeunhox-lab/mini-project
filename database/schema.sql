-- GrossRoutine Supabase 스키마 (전체)
-- Supabase 대시보드 → SQL Editor에서 이 파일 전체를 한 번 실행하세요.
-- 재실행해도 안전하도록 작성되어 있습니다 (idempotent).

create extension if not exists "pgcrypto";

create table if not exists routines (
  id uuid primary key default gen_random_uuid(),
  routine_name text not null,
  exercises jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists records (
  date text primary key, -- 'YYYY-MM-DD' (로컬 날짜 기준, 타임존 이슈 방지를 위해 text로 저장)
  routine_id uuid references routines(id) on delete set null,
  exercises jsonb not null default '[]'::jsonb,
  memo text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists records_routine_id_idx on records (routine_id);

alter table routines enable row level security;
alter table records enable row level security;

drop policy if exists "public read routines" on routines;
drop policy if exists "public write routines" on routines;
drop policy if exists "public update routines" on routines;
drop policy if exists "public delete routines" on routines;

create policy "public read routines" on routines for select using (true);
create policy "public write routines" on routines for insert with check (true);
create policy "public update routines" on routines for update using (true);
create policy "public delete routines" on routines for delete using (true);

drop policy if exists "public read records" on records;
drop policy if exists "public write records" on records;
drop policy if exists "public update records" on records;
drop policy if exists "public delete records" on records;

create policy "public read records" on records for select using (true);
create policy "public write records" on records for insert with check (true);
create policy "public update records" on records for update using (true);
create policy "public delete records" on records for delete using (true);
