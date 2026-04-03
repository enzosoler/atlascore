create or replace function public.apply_creator_code(p_user_id uuid, p_code text)
returns json
language plpgsql
security definer
as $$
declare
  v_influencer public.influencers%rowtype;
  v_profile public.profiles%rowtype;
begin
  -- Verify caller is the user
  if auth.uid() != p_user_id then
    return json_build_object('ok', false, 'error', 'unauthorized');
  end if;

  select * into v_influencer
  from public.influencers
  where upper(code) = upper(trim(p_code))
    and active = true;

  if v_influencer.id is null then
    return json_build_object('ok', false, 'error', 'invalid_code');
  end if;

  select * into v_profile
  from public.profiles
  where id = p_user_id;

  if v_profile.id is null then
    return json_build_object('ok', false, 'error', 'profile_not_found');
  end if;

  if v_profile.creator_locked = true then
    return json_build_object('ok', false, 'error', 'creator_locked');
  end if;

  update public.profiles
  set
    influencer_id = v_influencer.id,
    creator_code = v_influencer.code,
    creator_attached_at = now()
  where id = p_user_id;

  return json_build_object(
    'ok', true,
    'code', v_influencer.code,
    'creator', v_influencer.display_name
  );
end;
$$;

-- Admin analytics view
create or replace view public.influencer_summary as
select
  i.id,
  i.display_name,
  i.code,
  i.commission_percent,
  i.active,
  count(distinct p.id) as attached_users,
  count(distinct c.user_id) filter (where c.status != 'reversed') as paid_users,
  coalesce(sum(c.revenue_amount) filter (where c.status != 'reversed'), 0) as revenue_generated,
  coalesce(sum(c.commission_amount) filter (where c.status != 'reversed'), 0) as commission_owed
from public.influencers i
left join public.profiles p on p.influencer_id = i.id
left join public.influencer_commissions c on c.influencer_id = i.id
group by i.id, i.display_name, i.code, i.commission_percent, i.active;
