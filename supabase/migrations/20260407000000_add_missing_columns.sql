-- Add missing columns referenced by admin dashboard queries

-- error_logs: add component and route columns
alter table public.error_logs add column if not exists component text;
alter table public.error_logs add column if not exists route text;

-- workouts: add duration_seconds column
alter table public.workouts add column if not exists duration_seconds integer;

-- food_logs: add description column
alter table public.food_logs add column if not exists description text;
