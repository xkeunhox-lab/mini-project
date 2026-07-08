-- GrossRoutine Supabase 스키마 (전체)
-- Supabase 대시보드 → SQL Editor에서 이 파일 전체를 한 번 실행하세요.
-- 재실행해도 안전하도록 작성되어 있습니다 (idempotent).

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. routines / records — 앱의 핵심 데이터
-- ============================================================

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

-- 테스트/데모 사이트이므로 인증 없이 공개 읽기·쓰기를 허용합니다.
-- 실서비스로 전환 시 auth.uid() 기반 정책으로 교체하세요.
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

-- ============================================================
-- 2. app_stats — 누적 기록 횟수 (실시간 카운터)
--    "기록 저장"을 완료할 때마다 1씩 증가하는 단일 행(row) 카운터.
--    직접 UPDATE 권한은 주지 않고, increment_completions() RPC를 통해서만
--    증가시킬 수 있도록 해서 클라이언트가 임의의 값으로 덮어쓰지 못하게 막습니다.
-- ============================================================

create table if not exists app_stats (
  id smallint primary key default 1,
  total_completions bigint not null default 0,
  updated_at timestamptz not null default now(),
  constraint app_stats_singleton check (id = 1)
);

insert into app_stats (id, total_completions)
values (1, 0)
on conflict (id) do nothing;

alter table app_stats enable row level security;

drop policy if exists "public read app_stats" on app_stats;
create policy "public read app_stats" on app_stats for select using (true);
-- insert/update/delete 정책은 의도적으로 만들지 않습니다 (아래 RPC로만 변경 가능).

create or replace function increment_completions()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  new_count bigint;
begin
  update app_stats
  set total_completions = total_completions + 1,
      updated_at = now()
  where id = 1
  returning total_completions into new_count;

  return new_count;
end;
$$;

revoke all on function increment_completions() from public;
grant execute on function increment_completions() to anon, authenticated;

-- 실시간 구독(Realtime)이 가능하도록 퍼블리케이션에 추가합니다.
-- 이미 추가되어 있다면 에러가 날 수 있으니, 에러가 나면 이 블록만 무시해도 됩니다.
do $$
begin
  alter publication supabase_realtime add table app_stats;
exception
  when duplicate_object then
    null;
end
$$;
