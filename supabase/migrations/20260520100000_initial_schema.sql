-- akari MVP schema (draft)
-- 仕様: docs/spec/akari-protocol-1.0.md
-- TypeScript 対応: packages/core/src/model/

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Facilities（施設 / テナント）
-- ---------------------------------------------------------------------------
create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  preferred_locale text not null default 'ja-jp' check (preferred_locale = 'ja-jp'),
  created_at timestamptz not null default now()
);

comment on table public.facilities is 'マルチテナントの施設単位。RLS は facility_id で分離する。';

-- ---------------------------------------------------------------------------
-- Residents（入居者）
-- ---------------------------------------------------------------------------
create table public.residents (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities (id) on delete restrict,
  display_name text not null,
  year_of_birth int check (year_of_birth is null or year_of_birth between 1900 and 2100),
  preferred_locale text not null default 'ja-jp' check (preferred_locale = 'ja-jp'),
  created_at timestamptz not null default now(),
  archived_at timestamptz
);

create index residents_facility_id_idx on public.residents (facility_id);

-- ---------------------------------------------------------------------------
-- Profiles（auth.users と akari ロールの橋）
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  facility_id uuid references public.facilities (id) on delete restrict,
  role text not null check (
    role in (
      'resident',
      'caregiver',
      'life-counselor',
      'facility-admin',
      'family',
      'doctor'
    )
  ),
  -- resident ロールのとき、どの入居者か
  resident_id uuid references public.residents (id) on delete set null,
  display_name text,
  created_at timestamptz not null default now(),
  constraint profiles_resident_role_requires_resident_id check (
    role <> 'resident' or resident_id is not null
  ),
  constraint profiles_staff_requires_facility check (
    role in ('family', 'doctor') or facility_id is not null
  )
);

create index profiles_facility_id_idx on public.profiles (facility_id);
create index profiles_role_idx on public.profiles (role);

-- ---------------------------------------------------------------------------
-- Moods（きもち）
-- ---------------------------------------------------------------------------
create table public.moods (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references public.residents (id) on delete cascade,
  value text not null check (value in ('good', 'soso', 'tired', 'lonely')),
  source text not null check (source in ('self', 'caregiver_observed')),
  note text check (note is null or char_length(note) <= 140),
  created_at timestamptz not null default now()
);

create index moods_resident_id_created_at_idx on public.moods (resident_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Moments（出来事）— 中心概念
-- ---------------------------------------------------------------------------
create table public.moments (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references public.residents (id) on delete cascade,
  author_id uuid not null references auth.users (id) on delete restrict,
  text text not null check (
    char_length(trim(text)) > 0 and char_length(text) <= 280
  ),
  tags text[] not null default '{}' check (
    tags <@ array['meal', 'sleep', 'visit', 'smile', 'concern', 'health']::text[]
  ),
  visibility text not null check (
    visibility in ('caregiver_only', 'family_shareable')
  ),
  health boolean not null default false,
  created_at timestamptz not null default now(),
  shared_to_family_at timestamptz,
  constraint moments_family_shareable_has_timestamp check (
    visibility <> 'family_shareable' or shared_to_family_at is not null
  )
);

create index moments_resident_id_created_at_idx on public.moments (resident_id, created_at desc);
create index moments_family_feed_idx on public.moments (resident_id, created_at desc)
  where visibility = 'family_shareable' and shared_to_family_at is not null;

-- health タグがあれば health フラグを立てる（doctor 可視化）
create or replace function public.moments_sync_health_flag()
returns trigger
language plpgsql
as $$
begin
  new.health := 'health' = any (new.tags);
  return new;
end;
$$;

create trigger moments_sync_health_flag_trg
before insert or update on public.moments
for each row execute function public.moments_sync_health_flag();

-- ---------------------------------------------------------------------------
-- Connections（入居者 ↔ 家族）
-- ---------------------------------------------------------------------------
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  resident_id uuid not null references public.residents (id) on delete cascade,
  family_user_id uuid not null references auth.users (id) on delete cascade,
  relation text not null check (
    relation in ('child', 'spouse', 'sibling', 'grandchild', 'guardian', 'other')
  ),
  created_at timestamptz not null default now(),
  unique (resident_id, family_user_id)
);

create index connections_family_user_id_idx on public.connections (family_user_id);

-- ---------------------------------------------------------------------------
-- Invitations（招待リンク）
-- ---------------------------------------------------------------------------
create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  facility_id uuid not null references public.facilities (id) on delete cascade,
  role text not null check (
    role in (
      'resident',
      'caregiver',
      'life-counselor',
      'facility-admin',
      'family',
      'doctor'
    )
  ),
  target_resident_id uuid references public.residents (id) on delete cascade,
  issued_by uuid not null references auth.users (id) on delete restrict,
  token_hash text not null unique,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index invitations_token_hash_idx on public.invitations (token_hash)
  where consumed_at is null;

-- ---------------------------------------------------------------------------
-- Audit events（監査ログ — meta に PII を入れない）
-- ---------------------------------------------------------------------------
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users (id) on delete restrict,
  actor_role text not null,
  action text not null check (
    action in (
      'mood.create',
      'moment.create',
      'moment.share_to_family',
      'invite.issue',
      'invite.consume',
      'role.change',
      'delete.request',
      'delete.execute',
      'login.success',
      'login.failure'
    )
  ),
  target_type text check (target_type in ('resident', 'moment', 'mood', 'user')),
  target_id text,
  at timestamptz not null default now(),
  meta jsonb not null default '{}'::jsonb
);

create index audit_events_at_idx on public.audit_events (at desc);

-- ---------------------------------------------------------------------------
-- RLS helper functions
-- ---------------------------------------------------------------------------
create or replace function public.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from public.profiles where id = auth.uid()
$$;

create or replace function public.my_facility_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select facility_id from public.profiles where id = auth.uid()
$$;

create or replace function public.my_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.my_resident_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select resident_id from public.profiles where id = auth.uid()
$$;

-- 家族が紐づく入居者 ID の集合
create or replace function public.my_connected_resident_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select resident_id
  from public.connections
  where family_user_id = auth.uid()
$$;

-- 施設スタッフ（介護士・生活相談員・施設長）か
create or replace function public.is_facility_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('caregiver', 'life-counselor', 'facility-admin')
     from public.profiles where id = auth.uid()),
    false
  )
$$;
