-- ============================================================================
-- ATLAS CORE LEGAL, ADMIN & MODERATION SYSTEM
-- Migration: RBAC, Audit Logging, Terms Acceptance, Moderation
-- Based on: LEGAL_ADMIN_MODERATION_SPEC.md
-- ============================================================================

-- ============================================================================
-- SECTION 1: ROLES & PERMISSIONS (RBAC)
-- ============================================================================

-- Core roles table
create table if not exists roles (
  id uuid primary key default gen_random_uuid(),
  name varchar(50) unique not null,
  description text,
  level varchar(20) not null check (level in ('system', 'admin', 'moderation', 'read')),
  is_system_role boolean default false,
  created_at timestamp with time zone default now()
);

-- Granular permissions
create table if not exists permissions (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) unique not null,
  description text,
  category varchar(50), -- users, billing, moderation, system
  is_sensitive boolean default false,
  created_at timestamp with time zone default now()
);

-- Many-to-many: role_permissions
create table if not exists role_permissions (
  role_id uuid references roles(id) on delete cascade,
  permission_id uuid references permissions(id) on delete cascade,
  granted_at timestamp with time zone default now(),
  granted_by uuid references auth.users(id),
  primary key (role_id, permission_id)
);

-- User role assignments
create table if not exists user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role_id uuid references roles(id) on delete cascade,
  assigned_at timestamp with time zone default now(),
  assigned_by uuid references auth.users(id),
  expires_at timestamp with time zone,
  revoked_at timestamp with time zone,
  revoked_by uuid references auth.users(id),
  unique (user_id, role_id)
);

-- Seed system roles
insert into roles (name, description, level, is_system_role) values
  ('owner', 'Business owner with full access', 'system', true),
  ('super_admin', 'Technical system administrator', 'admin', true),
  ('admin_ops', 'Day-to-day operations', 'admin', true),
  ('billing_admin', 'Billing and subscription management', 'admin', true),
  ('support_admin', 'Customer support', 'admin', true),
  ('moderator', 'Content moderation', 'moderation', true),
  ('senior_moderator', 'Senior content moderation', 'moderation', true),
  ('readonly_analytics', 'Read-only analytics access', 'read', true)
on conflict (name) do nothing;

-- Seed permissions
insert into permissions (name, description, category, is_sensitive) values
  -- User management
  ('manage_users', 'View and edit basic user accounts', 'users', false),
  ('suspend_users', 'Temporarily disable accounts', 'users', true),
  ('ban_users', 'Permanently terminate accounts', 'users', true),
  ('impersonate_user', 'Login-as-user for support', 'users', true),
  ('reset_onboarding', 'Clear user onboarding state', 'users', false),
  ('revoke_sessions', 'Force logout on all devices', 'users', false),
  
  -- Billing
  ('manage_subscriptions', 'View and modify billing status', 'billing', false),
  ('process_refunds', 'Issue refunds via payment processor', 'billing', true),
  
  -- System
  ('manage_roles', 'Create, edit, assign roles', 'system', true),
  ('view_audit_logs', 'Access system audit trail', 'system', false),
  ('manage_feature_flags', 'Toggle system features', 'system', false),
  ('manage_internal_settings', 'System configuration', 'system', true),
  ('view_sensitive_analytics', 'PII-inclusive metrics', 'system', false),
  
  -- Moderation
  ('view_reported_photos', 'See reported content queue', 'moderation', false),
  ('view_all_photos', 'Browse non-reported user photos', 'moderation', true),
  ('view_private_photos', 'Access progress/health photos', 'moderation', true),
  ('moderate_photos', 'Take action on flagged content', 'moderation', true),
  ('remove_photos', 'Delete user content', 'moderation', true),
  ('export_moderation_evidence', 'Download case materials', 'moderation', true),
  ('senior_moderation_override', 'Reverse moderator decisions', 'moderation', true)
on conflict (name) do nothing;

-- Assign permissions to roles (simplified mapping)
-- Owner: all permissions
insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r, permissions p
where r.name = 'owner'
on conflict do nothing;

-- Super admin: system + admin permissions
insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r, permissions p
where r.name = 'super_admin'
  and p.category in ('system', 'users', 'billing')
  and p.name not in ('view_private_photos', 'view_all_photos', 'moderate_photos', 'remove_photos')
on conflict do nothing;

-- Admin ops: basic user management
insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r, permissions p
where r.name = 'admin_ops'
  and p.name in ('manage_users', 'suspend_users', 'reset_onboarding', 'revoke_sessions')
on conflict do nothing;

-- Billing admin
insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r, permissions p
where r.name = 'billing_admin'
  and p.name in ('manage_subscriptions', 'process_refunds')
on conflict do nothing;

-- Support admin
insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r, permissions p
where r.name = 'support_admin'
  and p.name in ('manage_users', 'reset_onboarding')
on conflict do nothing;

-- Moderator
insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r, permissions p
where r.name = 'moderator'
  and p.name in ('view_reported_photos', 'moderate_photos', 'remove_photos')
on conflict do nothing;

-- Senior moderator
insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r, permissions p
where r.name = 'senior_moderator'
  and p.name in (
    'view_reported_photos', 'view_all_photos', 'view_private_photos',
    'moderate_photos', 'remove_photos', 'export_moderation_evidence',
    'senior_moderation_override', 'ban_users'
  )
on conflict do nothing;

-- Readonly analytics
insert into role_permissions (role_id, permission_id)
select r.id, p.id
from roles r, permissions p
where r.name = 'readonly_analytics'
  and p.name in ('view_sensitive_analytics')
on conflict do nothing;

-- ============================================================================
-- SECTION 2: AUDIT LOGGING
-- ============================================================================

create table if not exists admin_action_logs (
  id uuid primary key default gen_random_uuid(),
  
  -- Actor
  actor_id uuid references auth.users(id),
  actor_role varchar(50) not null,
  actor_ip inet not null,
  actor_user_agent text,
  
  -- Target
  target_user_id uuid references auth.users(id),
  resource_type varchar(50) not null,
  resource_id uuid,
  
  -- Action
  action varchar(100) not null,
  action_category varchar(50),
  
  -- Context
  reason text,
  metadata jsonb,
  
  -- State tracking
  before_state jsonb,
  after_state jsonb,
  
  -- Severity
  severity varchar(20) default 'info' check (severity in ('info', 'warning', 'critical')),
  
  -- User visibility
  user_visible boolean default false,
  user_notification_sent boolean default false,
  
  -- Timestamps
  created_at timestamp with time zone default now(),
  
  -- Session tracking
  session_id uuid
);

-- ============================================================================
-- SECTION 3: TERMS ACCEPTANCE
-- ============================================================================

create table if not exists terms_acceptances (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  
  -- Signup terms
  accepted_terms_at timestamp with time zone,
  terms_version varchar(20),
  accepted_privacy_at timestamp with time zone,
  privacy_version varchar(20),
  
  -- Billing terms
  accepted_billing_terms_at timestamp with time zone,
  billing_terms_version varchar(20),
  
  -- Metadata
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- ============================================================================
-- SECTION 4: PHOTOS & MODERATION
-- ============================================================================

-- Extend existing photos table if it exists, or create new
do $$
begin
  -- Check if photos table exists
  if exists (select from information_schema.tables where table_name = 'photos') then
    -- Add new columns if they don't exist
    alter table photos add column if not exists category varchar(50) default 'profile' check (category in ('profile', 'social', 'progress', 'health'));
    alter table photos add column if not exists moderation_status varchar(50) default 'pending' check (moderation_status in ('pending', 'approved', 'rejected', 'under_review'));
    alter table photos add column if not exists report_count integer default 0;
    alter table photos add column if not exists last_reviewed_at timestamp with time zone;
    alter table photos add column if not exists reviewed_by uuid references auth.users(id);
  else
    -- Create photos table
    create table photos (
      id uuid primary key default gen_random_uuid(),
      user_id uuid references auth.users(id) not null,
      storage_path text not null,
      filename varchar(255),
      mime_type varchar(50),
      file_size_bytes integer,
      category varchar(50) default 'profile' check (category in ('profile', 'social', 'progress', 'health')),
      visibility varchar(50) default 'private' check (visibility in ('public', 'community', 'private')),
      status varchar(50) default 'active' check (status in ('active', 'hidden', 'removed', 'under_review')),
      moderation_status varchar(50) default 'pending' check (moderation_status in ('pending', 'approved', 'rejected', 'under_review')),
      report_count integer default 0,
      last_reviewed_at timestamp with time zone,
      reviewed_by uuid references auth.users(id),
      uploaded_at timestamp with time zone default now(),
      created_at timestamp with time zone default now(),
      updated_at timestamp with time zone default now(),
      deleted_at timestamp with time zone,
      view_count integer default 0
    );
  end if;
end $$;

-- Photo access logs (staff viewing user photos)
create table if not exists photo_access_logs (
  id uuid primary key default gen_random_uuid(),
  viewer_id uuid references auth.users(id) not null,
  viewer_role varchar(50) not null,
  viewer_ip inet not null,
  photo_id uuid references photos(id) not null,
  photo_category varchar(50) not null,
  photo_owner_id uuid references auth.users(id) not null,
  reason varchar(100) not null,
  reason_detail text,
  session_id uuid,
  viewed_at timestamp with time zone default now()
);

-- Moderation cases
create table if not exists moderation_cases (
  id uuid primary key default gen_random_uuid(),
  case_number varchar(50) unique not null,
  status varchar(20) default 'open' check (status in ('open', 'resolved', 'escalated', 'dismissed')),
  priority varchar(20) default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  target_user_id uuid references auth.users(id) not null,
  reported_content_type varchar(50),
  reported_content_id uuid,
  reporter_id uuid references auth.users(id),
  report_reason varchar(100),
  report_description text,
  assigned_to uuid references auth.users(id),
  assigned_at timestamp with time zone,
  resolution varchar(50),
  resolved_at timestamp with time zone,
  resolved_by uuid references auth.users(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Moderation actions (individual decisions)
create table if not exists moderation_actions (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references moderation_cases(id),
  moderator_id uuid references auth.users(id) not null,
  moderator_role varchar(50) not null,
  action varchar(50) not null check (action in ('keep', 'remove', 'hide', 'warn', 'suspend', 'ban', 'escalate', 'restore')),
  action_category varchar(50),
  target_user_id uuid references auth.users(id),
  target_photo_id uuid references photos(id),
  reason text not null,
  internal_notes text,
  created_at timestamp with time zone default now(),
  ip_address inet,
  session_id uuid
);

-- ============================================================================
-- SECTION 5: FEATURE FLAGS & USER FLAGS
-- ============================================================================

create table if not exists feature_flags (
  id uuid primary key default gen_random_uuid(),
  key varchar(100) unique not null,
  name varchar(255) not null,
  description text,
  enabled boolean default false,
  rollout_percentage integer default 100 check (rollout_percentage between 0 and 100),
  targeting_rules jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists user_flags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  flag_type varchar(50) not null,
  flag_reason text,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  resolved_at timestamp with time zone,
  resolved_by uuid references auth.users(id),
  unique (user_id, flag_type)
);

-- ============================================================================
-- SECTION 6: INTERNAL NOTES
-- ============================================================================

create table if not exists internal_notes (
  id uuid primary key default gen_random_uuid(),
  target_user_id uuid references auth.users(id) not null,
  author_id uuid references auth.users(id) not null,
  content text not null,
  note_type varchar(50) default 'general' check (note_type in ('general', 'support', 'moderation', 'billing')),
  is_pinned boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================================================
-- SECTION 7: INDEXES
-- ============================================================================

-- Roles & permissions indexes
create index if not exists idx_roles_name on roles(name);
create index if not exists idx_permissions_name on permissions(name);
create index if not exists idx_permissions_category on permissions(category);
create index if not exists idx_role_permissions_role on role_permissions(role_id);
create index if not exists idx_user_roles_user on user_roles(user_id);
create index if not exists idx_user_roles_role on user_roles(role_id);
create index if not exists idx_user_roles_active on user_roles(user_id, role_id) where revoked_at is null;

-- Audit log indexes
create index if not exists idx_audit_actor on admin_action_logs(actor_id, created_at desc);
create index if not exists idx_audit_target on admin_action_logs(target_user_id, created_at desc);
create index if not exists idx_audit_resource on admin_action_logs(resource_type, resource_id);
create index if not exists idx_audit_action on admin_action_logs(action, created_at desc);
create index if not exists idx_audit_severity on admin_action_logs(severity, created_at desc);
create index if not exists idx_audit_user_visible on admin_action_logs(target_user_id, user_visible) where user_visible = true;
create index if not exists idx_audit_created on admin_action_logs(created_at desc);

-- Terms acceptance indexes
create index if not exists idx_terms_user on terms_acceptances(user_id);
create index if not exists idx_terms_versions on terms_acceptances(user_id, terms_version, privacy_version);

-- Photo indexes
create index if not exists idx_photos_user on photos(user_id);
create index if not exists idx_photos_category on photos(category);
create index if not exists idx_photos_status on photos(status);
create index if not exists idx_photos_moderation on photos(moderation_status);
create index if not exists idx_photos_uploaded on photos(uploaded_at desc);
create index if not exists idx_photos_reported on photos(report_count desc) where report_count > 0;

-- Photo access log indexes
create index if not exists idx_photo_access_viewer on photo_access_logs(viewer_id, viewed_at desc);
create index if not exists idx_photo_access_photo on photo_access_logs(photo_id);
create index if not exists idx_photo_access_owner on photo_access_logs(photo_owner_id);
create index if not exists idx_photo_access_reason on photo_access_logs(reason);

-- Moderation indexes
create index if not exists idx_cases_status on moderation_cases(status);
create index if not exists idx_cases_assigned on moderation_cases(assigned_to, status);
create index if not exists idx_cases_target on moderation_cases(target_user_id);
create index if not exists idx_cases_reporter on moderation_cases(reporter_id);
create index if not exists idx_cases_created on moderation_cases(created_at desc);
create index if not exists idx_moderation_actions_case on moderation_actions(case_id);
create index if not exists idx_moderation_actions_moderator on moderation_actions(moderator_id);

-- Feature flags & user flags
create index if not exists idx_feature_flags_key on feature_flags(key);
create index if not exists idx_user_flags_user on user_flags(user_id);
create index if not exists idx_user_flags_type on user_flags(flag_type);
create index if not exists idx_user_flags_active on user_flags(user_id) where resolved_at is null;

-- Internal notes
create index if not exists idx_internal_notes_target on internal_notes(target_user_id, created_at desc);
create index if not exists idx_internal_notes_author on internal_notes(author_id);
create index if not exists idx_internal_notes_type on internal_notes(target_user_id, note_type);

-- ============================================================================
-- SECTION 8: RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table user_roles enable row level security;
alter table admin_action_logs enable row level security;
alter table terms_acceptances enable row level security;
alter table photos enable row level security;
alter table photo_access_logs enable row level security;
alter table moderation_cases enable row level security;
alter table moderation_actions enable row level security;
alter table feature_flags enable row level security;
alter table user_flags enable row level security;
alter table internal_notes enable row level security;

-- Roles: readable by all, writable only by super admins
-- Note: This uses a helper function that checks user permissions

create or replace function has_permission(user_uuid uuid, perm_name varchar)
returns boolean as $$
begin
  return exists (
    select 1
    from user_roles ur
    join role_permissions rp on ur.role_id = rp.role_id
    join permissions p on rp.permission_id = p.id
    where ur.user_id = user_uuid
      and ur.revoked_at is null
      and (ur.expires_at is null or ur.expires_at > now())
      and p.name = perm_name
  );
end;
$$ language plpgsql security definer;

create or replace function is_admin_user(user_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from user_roles ur
    join roles r on ur.role_id = r.id
    where ur.user_id = user_uuid
      and ur.revoked_at is null
      and (ur.expires_at is null or ur.expires_at > now())
      and r.level in ('system', 'admin')
  );
end;
$$ language plpgsql security definer;

create or replace function is_moderator_user(user_uuid uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from user_roles ur
    join roles r on ur.role_id = r.id
    where ur.user_id = user_uuid
      and ur.revoked_at is null
      and (ur.expires_at is null or ur.expires_at > now())
      and r.level in ('moderation')
  );
end;
$$ language plpgsql security definer;

-- RLS Policies

-- Roles
-- Allow all authenticated users to read roles (needed for UI)
create policy "Roles readable by authenticated users"
  on roles for select
  to authenticated
  using (true);

-- Only super admins can modify roles
create policy "Roles writable by super admins"
  on roles for all
  to authenticated
  using (has_permission(auth.uid(), 'manage_roles'));

-- Permissions
create policy "Permissions readable by authenticated users"
  on permissions for select
  to authenticated
  using (true);

create policy "Permissions writable by super admins"
  on permissions for all
  to authenticated
  using (has_permission(auth.uid(), 'manage_roles'));

-- Role permissions
create policy "Role permissions readable by authenticated users"
  on role_permissions for select
  to authenticated
  using (true);

create policy "Role permissions writable by super admins"
  on role_permissions for all
  to authenticated
  using (has_permission(auth.uid(), 'manage_roles'));

-- User roles
create policy "User roles readable by admin users"
  on user_roles for select
  to authenticated
  using (is_admin_user(auth.uid()) or auth.uid() = user_id);

create policy "User roles writable by super admins"
  on user_roles for all
  to authenticated
  using (has_permission(auth.uid(), 'manage_roles'));

-- Audit logs: admin users can read, but not modify
create policy "Audit logs readable by admin users"
  on admin_action_logs for select
  to authenticated
  using (has_permission(auth.uid(), 'view_audit_logs'));

-- Terms acceptances: users can read their own, admins with manage_users can read all
create policy "Terms readable by owner or admin"
  on terms_acceptances for select
  to authenticated
  using (user_id = auth.uid() or has_permission(auth.uid(), 'manage_users'));

create policy "Terms writable by owner"
  on terms_acceptances for insert
  to authenticated
  with check (user_id = auth.uid());

-- Photos: users can manage their own, moderators have special access via functions
create policy "Photos readable by owner"
  on photos for select
  to authenticated
  using (user_id = auth.uid());

create policy "Photos writable by owner"
  on photos for all
  to authenticated
  using (user_id = auth.uid());

-- Photo access logs: only admin/moderator users can read
create policy "Photo access logs readable by moderators"
  on photo_access_logs for select
  to authenticated
  using (is_moderator_user(auth.uid()) or has_permission(auth.uid(), 'view_audit_logs'));

-- Moderation cases: moderators can read/write
create policy "Moderation cases readable by moderators"
  on moderation_cases for select
  to authenticated
  using (is_moderator_user(auth.uid()) or has_permission(auth.uid(), 'view_audit_logs'));

create policy "Moderation cases writable by moderators"
  on moderation_cases for all
  to authenticated
  using (has_permission(auth.uid(), 'moderate_photos'));

-- Moderation actions
create policy "Moderation actions readable by moderators"
  on moderation_actions for select
  to authenticated
  using (is_moderator_user(auth.uid()) or has_permission(auth.uid(), 'view_audit_logs'));

create policy "Moderation actions writable by moderators"
  on moderation_actions for insert
  to authenticated
  with check (has_permission(auth.uid(), 'moderate_photos'));

-- Feature flags: readable by all, writable by admins
create policy "Feature flags readable by all authenticated"
  on feature_flags for select
  to authenticated
  using (true);

create policy "Feature flags writable by admins"
  on feature_flags for all
  to authenticated
  using (has_permission(auth.uid(), 'manage_feature_flags'));

-- User flags: admin readable
create policy "User flags readable by admins"
  on user_flags for select
  to authenticated
  using (is_admin_user(auth.uid()));

create policy "User flags writable by admins"
  on user_flags for all
  to authenticated
  using (is_admin_user(auth.uid()));

-- Internal notes: admin readable, author can update their own
create policy "Internal notes readable by admins"
  on internal_notes for select
  to authenticated
  using (is_admin_user(auth.uid()));

create policy "Internal notes writable by admins"
  on internal_notes for insert
  to authenticated
  with check (is_admin_user(auth.uid()));

create policy "Internal notes updatable by author"
  on internal_notes for update
  to authenticated
  using (author_id = auth.uid());

-- ============================================================================
-- SECTION 9: TRIGGERS & FUNCTIONS
-- ============================================================================

-- Auto-update timestamps
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_photos_updated_at before update on photos
  for each row execute function update_updated_at_column();

create trigger update_moderation_cases_updated_at before update on moderation_cases
  for each row execute function update_updated_at_column();

create trigger update_feature_flags_updated_at before update on feature_flags
  for each row execute function update_updated_at_column();

create trigger update_internal_notes_updated_at before update on internal_notes
  for each row execute function update_updated_at_column();

-- Generate case numbers for moderation cases
create or replace function generate_case_number()
returns trigger as $$
begin
  new.case_number = 'CASE-' || to_char(now(), 'YYYYMMDD') || '-' || substr(md5(random()::text), 1, 6);
  return new;
end;
$$ language plpgsql;

create trigger set_case_number before insert on moderation_cases
  for each row execute function generate_case_number();

-- ============================================================================
-- SECTION 10: VIEWS FOR CONVENIENCE
-- ============================================================================

-- User permissions view
create or replace view user_permissions as
select 
  ur.user_id,
  r.name as role_name,
  p.name as permission_name,
  p.category as permission_category,
  p.is_sensitive
from user_roles ur
join roles r on ur.role_id = r.id
join role_permissions rp on r.id = rp.role_id
join permissions p on rp.permission_id = p.id
where ur.revoked_at is null
  and (ur.expires_at is null or ur.expires_at > now());

-- Reported photos queue view
create or replace view reported_photos_queue as
select 
  p.id as photo_id,
  p.user_id as owner_id,
  p.category,
  p.storage_path,
  p.report_count,
  p.moderation_status,
  p.uploaded_at,
  mc.id as case_id,
  mc.case_number,
  mc.status as case_status,
  mc.priority,
  mc.assigned_to,
  mc.reporter_id,
  mc.report_reason
from photos p
left join moderation_cases mc on mc.reported_content_id = p.id and mc.reported_content_type = 'photo'
where p.report_count > 0 or p.moderation_status in ('pending', 'under_review')
order by p.report_count desc, p.uploaded_at desc;

-- User admin summary view
create or replace view user_admin_summary as
select 
  u.id,
  u.email,
  u.raw_user_meta_data->>'full_name' as full_name,
  u.created_at,
  u.last_sign_in_at,
  u.email_confirmed_at is not null as email_verified,
  case 
    when u.banned_until is not null and u.banned_until > now() then 'suspended'
    when exists (select 1 from user_flags where user_id = u.id and resolved_at is null and flag_type = 'banned') then 'banned'
    else 'active'
  end as account_status,
  (select array_agg(r.name) from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = u.id and ur.revoked_at is null) as roles,
  (select count(*) from photos where user_id = u.id and status = 'active') as photo_count,
  (select count(*) from moderation_cases where target_user_id = u.id and status = 'open') as open_cases
from auth.users u;

-- ============================================================================
-- SECTION 11: AUDIT LOGGING TRIGGER FUNCTIONS
-- ============================================================================

-- Helper to log admin actions
create or replace function log_admin_action(
  p_actor_id uuid,
  p_actor_role varchar,
  p_actor_ip inet,
  p_target_user_id uuid,
  p_resource_type varchar,
  p_resource_id uuid,
  p_action varchar,
  p_action_category varchar,
  p_reason text,
  p_before_state jsonb,
  p_after_state jsonb,
  p_severity varchar,
  p_user_visible boolean
)
returns uuid as $$
declare
  v_log_id uuid;
begin
  insert into admin_action_logs (
    actor_id, actor_role, actor_ip,
    target_user_id, resource_type, resource_id,
    action, action_category, reason,
    before_state, after_state, severity, user_visible
  ) values (
    p_actor_id, p_actor_role, p_actor_ip,
    p_target_user_id, p_resource_type, p_resource_id,
    p_action, p_action_category, p_reason,
    p_before_state, p_after_state, p_severity, p_user_visible
  )
  returning id into v_log_id;
  
  return v_log_id;
end;
$$ language plpgsql security definer;

-- Log photo access by staff
create or replace function log_photo_access(
  p_viewer_id uuid,
  p_photo_id uuid,
  p_reason varchar,
  p_reason_detail text
)
returns void as $$
declare
  v_photo photos%rowtype;
  v_role varchar;
begin
  -- Get photo details
  select * into v_photo from photos where id = p_photo_id;
  
  -- Get viewer's highest role
  select r.name into v_role
  from user_roles ur
  join roles r on ur.role_id = r.id
  where ur.user_id = p_viewer_id
    and ur.revoked_at is null
    and (ur.expires_at is null or ur.expires_at > now())
  order by case r.level 
    when 'system' then 1 
    when 'admin' then 2 
    when 'moderation' then 3 
    else 4 
  end
  limit 1;
  
  -- Insert access log
  insert into photo_access_logs (
    viewer_id, viewer_role, viewer_ip,
    photo_id, photo_category, photo_owner_id,
    reason, reason_detail
  ) values (
    p_viewer_id, v_role, inet_client_addr(),
    p_photo_id, v_photo.category, v_photo.user_id,
    p_reason, p_reason_detail
  );
end;
$$ language plpgsql security definer;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

comment on table roles is 'RBAC role definitions';
comment on table permissions is 'Granular permission definitions';
comment on table user_roles is 'User to role assignments';
comment on table admin_action_logs is 'Audit trail for all admin actions';
comment on table terms_acceptances is 'User acceptance of legal terms';
comment on table photo_access_logs is 'Staff access to user photos';
comment on table moderation_cases is 'Moderation investigation tracking';
comment on table moderation_actions is 'Individual moderation decisions';
comment on table internal_notes is 'Internal staff notes on users';
