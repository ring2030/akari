-- pgTAP-style RLS smoke tests for family isolation
-- 実行: supabase test db（要 Supabase CLI + Docker）
-- 手動: psql 接続後に \i supabase/tests/rls_family_isolation.sql

begin;

-- テスト用施設・入居者
insert into public.facilities (id, name)
values
  ('11111111-1111-1111-1111-111111111111', 'テスト施設 A'),
  ('22222222-2222-2222-2222-222222222222', 'テスト施設 B');

insert into public.residents (id, facility_id, display_name)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', '清子さん'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', '太郎さん'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', '花子さん');

-- auth.users は Supabase Auth 経由で作る想定。
-- 以下は psql で auth.uid() を set_config で模擬する簡易パターン（ローカル検証用）

-- 期待:
-- 1. family A は resident A の family_shareable moments のみ SELECT 可
-- 2. family A は resident B の moments は SELECT 不可
-- 3. caregiver は自施設の全 moments を SELECT 可

-- サンプル moment（家族共有可）
-- insert into public.moments (...) — 実際のテストは seed + set local role で実行

rollback;

-- TODO(Week 1): supabase/seed.sql と pgTAP を接続し CI に追加
