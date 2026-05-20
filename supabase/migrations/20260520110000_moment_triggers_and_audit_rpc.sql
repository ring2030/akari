-- family_shareable のとき shared_to_family_at を自動設定
create or replace function public.moments_set_family_shared_at()
returns trigger
language plpgsql
as $$
begin
  if new.visibility = 'family_shareable' and new.shared_to_family_at is null then
    new.shared_to_family_at := now();
  end if;
  return new;
end;
$$;

create trigger moments_set_family_shared_at_trg
before insert or update on public.moments
for each row execute function public.moments_set_family_shared_at();

-- 認証ユーザーからの監査ログ（RLS バイパスしない安全な経路）
create or replace function public.record_audit_event(
  p_action text,
  p_actor_role text,
  p_target_type text default null,
  p_target_id text default null,
  p_meta jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_actor uuid;
begin
  v_actor := auth.uid();
  if v_actor is null then
    raise exception 'not authenticated';
  end if;

  insert into public.audit_events (
    actor_id,
    actor_role,
    action,
    target_type,
    target_id,
    meta
  )
  values (
    v_actor,
    p_actor_role,
    p_action,
    p_target_type,
    p_target_id,
    coalesce(p_meta, '{}'::jsonb)
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.record_audit_event(text, text, text, text, jsonb) from public;
grant execute on function public.record_audit_event(text, text, text, text, jsonb) to authenticated;
