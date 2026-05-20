-- akari RLS policies (MVP draft)
-- 原則: 施設テナント分離 + family は紐づく入居者のみ + doctor は health moments のみ

alter table public.facilities enable row level security;
alter table public.residents enable row level security;
alter table public.profiles enable row level security;
alter table public.moods enable row level security;
alter table public.moments enable row level security;
alter table public.connections enable row level security;
alter table public.invitations enable row level security;
alter table public.audit_events enable row level security;

-- ---------------------------------------------------------------------------
-- facilities
-- ---------------------------------------------------------------------------
create policy facilities_select_staff on public.facilities
  for select to authenticated
  using (id = public.my_facility_id() and public.is_facility_staff());

create policy facilities_select_admin on public.facilities
  for select to authenticated
  using (
    id = public.my_facility_id()
    and public.my_role() = 'facility-admin'
  );

-- ---------------------------------------------------------------------------
-- residents
-- ---------------------------------------------------------------------------
create policy residents_select_staff on public.residents
  for select to authenticated
  using (
    facility_id = public.my_facility_id()
    and public.is_facility_staff()
  );

create policy residents_select_family on public.residents
  for select to authenticated
  using (
    public.my_role() = 'family'
    and id in (select public.my_connected_resident_ids())
  );

create policy residents_select_self on public.residents
  for select to authenticated
  using (
    public.my_role() = 'resident'
    and id = public.my_resident_id()
  );

create policy residents_select_doctor on public.residents
  for select to authenticated
  using (
    public.my_role() = 'doctor'
    and facility_id = public.my_facility_id()
  );

-- ---------------------------------------------------------------------------
-- profiles（自分のプロフィール + 施設長は同施設を閲覧）
-- ---------------------------------------------------------------------------
create policy profiles_select_self on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy profiles_select_facility_admin on public.profiles
  for select to authenticated
  using (
    public.my_role() = 'facility-admin'
    and facility_id = public.my_facility_id()
  );

create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- moods
-- ---------------------------------------------------------------------------
create policy moods_insert_resident on public.moods
  for insert to authenticated
  with check (
    public.my_role() = 'resident'
    and resident_id = public.my_resident_id()
    and source = 'self'
  );

create policy moods_insert_staff on public.moods
  for insert to authenticated
  with check (
    public.is_facility_staff()
    and resident_id in (
      select id from public.residents where facility_id = public.my_facility_id()
    )
  );

create policy moods_select_staff on public.moods
  for select to authenticated
  using (
    public.is_facility_staff()
    and resident_id in (
      select id from public.residents where facility_id = public.my_facility_id()
    )
  );

create policy moods_select_self on public.moods
  for select to authenticated
  using (
    public.my_role() = 'resident'
    and resident_id = public.my_resident_id()
  );

-- family は mood を読まない（MVP）。moments のみ。

-- ---------------------------------------------------------------------------
-- moments
-- ---------------------------------------------------------------------------
create policy moments_insert_staff on public.moments
  for insert to authenticated
  with check (
    public.is_facility_staff()
    and resident_id in (
      select id from public.residents where facility_id = public.my_facility_id()
    )
    and author_id = auth.uid()
  );

create policy moments_select_staff on public.moments
  for select to authenticated
  using (
    public.is_facility_staff()
    and resident_id in (
      select id from public.residents where facility_id = public.my_facility_id()
    )
  );

create policy moments_select_family on public.moments
  for select to authenticated
  using (
    public.my_role() = 'family'
    and visibility = 'family_shareable'
    and shared_to_family_at is not null
    and resident_id in (select public.my_connected_resident_ids())
  );

create policy moments_select_doctor on public.moments
  for select to authenticated
  using (
    public.my_role() = 'doctor'
    and health = true
    and resident_id in (
      select id from public.residents where facility_id = public.my_facility_id()
    )
  );

-- ---------------------------------------------------------------------------
-- connections
-- ---------------------------------------------------------------------------
create policy connections_select_family on public.connections
  for select to authenticated
  using (family_user_id = auth.uid());

create policy connections_select_staff on public.connections
  for select to authenticated
  using (
    public.is_facility_staff()
    and resident_id in (
      select id from public.residents where facility_id = public.my_facility_id()
    )
  );

create policy connections_insert_staff on public.connections
  for insert to authenticated
  with check (
    public.my_role() in ('facility-admin', 'life-counselor')
    and resident_id in (
      select id from public.residents where facility_id = public.my_facility_id()
    )
  );

-- ---------------------------------------------------------------------------
-- invitations（施設長のみ発行・閲覧）
-- ---------------------------------------------------------------------------
create policy invitations_facility_admin on public.invitations
  for all to authenticated
  using (
    public.my_role() = 'facility-admin'
    and facility_id = public.my_facility_id()
  )
  with check (
    public.my_role() = 'facility-admin'
    and facility_id = public.my_facility_id()
    and issued_by = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- audit_events（施設長のみ閲覧、挿入は service role / サーバー経由を想定）
-- ---------------------------------------------------------------------------
create policy audit_events_select_admin on public.audit_events
  for select to authenticated
  using (
    public.my_role() = 'facility-admin'
    and actor_id in (
      select id from public.profiles where facility_id = public.my_facility_id()
    )
  );

-- アプリサーバーからの insert は service_role を使う（RLS バイパス）
-- 将来: security definer 関数で制限付き insert を追加
