-- akari デモシード（個人を特定できない架空データ）
-- 適用: supabase db reset
-- デモログイン（Week 2）: AKARI_DEMO_MODE=true + service role

-- ---------------------------------------------------------------------------
-- 施設・入居者
-- ---------------------------------------------------------------------------
insert into public.facilities (id, name)
values (
  '11111111-1111-4111-8111-111111111101',
  'デモ施設 あかり'
)
on conflict (id) do nothing;

insert into public.residents (id, facility_id, display_name, year_of_birth)
values
  (
    '11111111-1111-4111-8111-111111111201',
    '11111111-1111-4111-8111-111111111101',
    'やすこ',
    1938
  ),
  (
    '11111111-1111-4111-8111-111111111202',
    '11111111-1111-4111-8111-111111111101',
    'いちろう',
    1942
  ),
  (
    '11111111-1111-4111-8111-111111111203',
    '11111111-1111-4111-8111-111111111101',
    'みち',
    1945
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- デモ Auth ユーザー（パスワード: demo-akari-2026）
-- ---------------------------------------------------------------------------
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'caregiver@demo.akari.local',
    crypt('demo-akari-2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"デモ介護士"}',
    now(),
    now()
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'resident@demo.akari.local',
    crypt('demo-akari-2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"やすこ"}',
    now(),
    now()
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'family@demo.akari.local',
    crypt('demo-akari-2026', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"ご家族"}',
    now(),
    now()
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1","email":"caregiver@demo.akari.local"}',
    'email',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    now(),
    now(),
    now()
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2","email":"resident@demo.akari.local"}',
    'email',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    now(),
    now(),
    now()
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    '{"sub":"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3","email":"family@demo.akari.local"}',
    'email',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    now(),
    now(),
    now()
  )
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- プロフィール
-- ---------------------------------------------------------------------------
insert into public.profiles (id, facility_id, role, resident_id, display_name)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '11111111-1111-4111-8111-111111111101',
    'caregiver',
    null,
    'デモ介護士'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2',
    '11111111-1111-4111-8111-111111111101',
    'resident',
    '11111111-1111-4111-8111-111111111201',
    'やすこ'
  ),
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
    '11111111-1111-4111-8111-111111111101',
    'family',
    null,
    'ご家族'
  )
on conflict (id) do nothing;

-- 家族 ↔ やすこ
insert into public.connections (id, resident_id, family_user_id, relation)
values (
  '22222222-2222-4222-8222-222222222201',
  '11111111-1111-4111-8111-111111111201',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3',
  'child'
)
on conflict (resident_id, family_user_id) do nothing;

-- ---------------------------------------------------------------------------
-- サンプルデータ
-- ---------------------------------------------------------------------------
insert into public.moods (resident_id, value, source, note)
values (
  '11111111-1111-4111-8111-111111111201',
  'good',
  'self',
  null
);

insert into public.moments (
  resident_id,
  author_id,
  text,
  tags,
  visibility,
  health,
  shared_to_family_at
)
values
  (
    '11111111-1111-4111-8111-111111111201',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '午後のお茶を楽しそうに飲まれました。',
    array['meal', 'smile'],
    'family_shareable',
    false,
    now()
  ),
  (
    '11111111-1111-4111-8111-111111111202',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    '散歩に出かけて、空を見上げていらっしゃいました。',
    array['smile'],
    'caregiver_only',
    false,
    null
  );
