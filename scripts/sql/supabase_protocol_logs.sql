-- ============================================================
-- Atlas Core — Protocol Logs table + RLS
-- Tracks individual dose administrations for concentration calculations
-- Run this in Supabase → SQL Editor
-- ============================================================

create table if not exists public.protocol_logs (
  -- Primary key
  id             uuid          primary key default gen_random_uuid(),

  -- Links to protocol and user
  protocol_id    uuid          not null references public.protocols(id) on delete cascade,
  user_id        uuid          not null references auth.users(id) on delete cascade,

  -- Dose details (override protocol defaults if needed)
  dose_amount    numeric       not null,
  unit           text          not null default 'mg',

  -- Administration details
  taken_at       timestamptz   not null default now(),
  notes          text          not null default '',

  -- Optional: injection site, batch info, etc.
  site           text          default '',
  batch_number   text          default '',

  -- Timestamps
  created_at     timestamptz   not null default now(),
  updated_at     timestamptz   not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
create index if not exists protocol_logs_user_id_idx
  on public.protocol_logs (user_id);

create index if not exists protocol_logs_protocol_id_idx
  on public.protocol_logs (protocol_id);

create index if not exists protocol_logs_taken_at_idx
  on public.protocol_logs (taken_at desc);

create index if not exists protocol_logs_user_protocol_taken_at_idx
  on public.protocol_logs (user_id, protocol_id, taken_at desc);

-- ── Row-Level Security ────────────────────────────────────────────────────────
alter table public.protocol_logs enable row level security;

-- SELECT: users see only their own rows
-- (protocol_logs inherit ownership via protocol, but we keep user_id for direct RLS)
create policy "protocol_logs_select_own"
  on public.protocol_logs
  for select
  using (auth.uid() = user_id);

-- INSERT: users can only create rows for themselves
create policy "protocol_logs_insert_own"
  on public.protocol_logs
  for insert
  with check (auth.uid() = user_id);

-- UPDATE: users can only update their own rows
create policy "protocol_logs_update_own"
  on public.protocol_logs
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- DELETE: users can only delete their own rows
create policy "protocol_logs_delete_own"
  on public.protocol_logs
  for delete
  using (auth.uid() = user_id);

-- ── Helper function: Calculate concentration at a given time ────────────────
-- Uses one-compartment model with first-order elimination
-- C(t) = sum of all doses: (dose * bioavailability) * e^(-k * (t - t_dose))
-- where k = ln(2) / half_life

create or replace function public.calculate_protocol_concentration(
  p_protocol_id uuid,
  p_target_time timestamptz default now()
)
returns numeric
language plpgsql
security definer
as $$
declare
  v_half_life numeric;
  v_bioavailability numeric := 1.0; -- Default 100%, can be adjusted per substance
  v_k numeric; -- elimination rate constant
  v_concentration numeric := 0;
  v_dose record;
begin
  -- Get half-life from protocol or default to 1 day
  select coALESCE(
    estimated_half_life_days,
    case substance_name
      when 'Cipionato de Testosterona' then 8.0
      when 'Test C' then 8.0
      when 'Enantato de Testosterona' then 4.5
      when 'Test E' then 4.5
      when 'Propionato de Testosterona' then 0.8
      when 'Test P' then 0.8
      when 'Undecanoato de Testosterona' then 20.9
      when 'Nebido' then 20.9
      when 'Decanoato de Nandrolona' then 12.0
      when 'Deca' then 12.0
      when 'Fenilpropionato de Nandrolona' then 2.5
      when 'NPP' then 2.5
      when 'Acetato de Trembolona' then 1.0
      when 'Tren A' then 1.0
      when 'Enantato de Trembolona' then 5.0
      when 'Tren E' then 5.0
      else 1.0
    end
  ) into v_half_life
  from public.protocols
  where id = p_protocol_id;

  -- Calculate elimination rate constant k = ln(2) / half_life
  v_k := ln(2.0) / v_half_life;

  -- Sum contributions from all doses
  for v_dose in
    select dose_amount, taken_at
    from public.protocol_logs
    where protocol_id = p_protocol_id
      and taken_at <= p_target_time
    order by taken_at
  loop
    -- Time difference in days
    declare
      v_t_diff numeric := extract(epoch from (p_target_time - v_dose.taken_at)) / 86400.0;
    begin
      -- Add contribution from this dose (decayed)
      if v_t_diff >= 0 then
        v_concentration := v_concentration + (v_dose.dose_amount * v_bioavailability * exp(-v_k * v_t_diff));
      end if;
    end;
  end loop;

  return round(v_concentration::numeric, 2);
end;
$$;

-- ── Function: Get concentration time series for charting ───────────────────────
create or replace function public.get_protocol_concentration_series(
  p_protocol_id uuid,
  p_days_back integer default 30,
  p_days_forward integer default 7
)
returns table (
  time_point timestamptz,
  concentration numeric,
  relative_to_baseline numeric
)
language plpgsql
security definer
as $$
declare
  v_start_time timestamptz;
  v_end_time timestamptz;
  v_baseline numeric; -- concentration at start
  v_current_time timestamptz;
  v_step interval := '1 hour'::interval;
begin
  -- Determine time range
  v_start_time := now() - (p_days_back || ' days')::interval;
  v_end_time := now() + (p_days_forward || ' days')::interval;

  -- Calculate baseline (at start time)
  v_baseline := public.calculate_protocol_concentration(p_protocol_id, v_start_time);
  if v_baseline = 0 then
    v_baseline := 1; -- Avoid division by zero, use 1 as reference
  end if;

  -- Generate time series
  v_current_time := v_start_time;
  while v_current_time <= v_end_time loop
    time_point := v_current_time;
    concentration := public.calculate_protocol_concentration(p_protocol_id, v_current_time);
    relative_to_baseline := round((concentration / v_baseline) * 100, 1);
    return next;
    v_current_time := v_current_time + v_step;
  end loop;

  return;
end;
$$;

-- ── Trigger: Auto-update updated_at ───────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger set_protocol_logs_updated_at
  before update on public.protocol_logs
  for each row
  execute function public.set_updated_at();
