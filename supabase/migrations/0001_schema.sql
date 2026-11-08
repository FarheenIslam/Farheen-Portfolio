-- =====================================================================
-- Portfolio database schema (PostgreSQL / Supabase)
-- Run order: 0001_schema.sql -> 0002_rls.sql -> 0003_storage.sql -> seed.sql
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Shared updated_at trigger
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- admins: maps Supabase Auth users to application administrators.
-- Every active row has identical permissions (no super admin).
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  is_active boolean not null default true,
  invited_by uuid references public.admins (id) on delete set null,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admins_email_idx on public.admins (lower(email));

drop trigger if exists admins_set_updated_at on public.admins;
create trigger admins_set_updated_at
  before update on public.admins
  for each row execute function public.set_updated_at();

-- Pending invitations. A person can only become an admin if a valid,
-- unexpired invitation exists for their verified email address.
create table if not exists public.admin_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  full_name text,
  token uuid not null unique default gen_random_uuid(),
  invited_by uuid references public.admins (id) on delete set null,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists admin_invites_email_idx on public.admin_invites (lower(email));
create index if not exists admin_invites_token_idx on public.admin_invites (token);

-- ---------------------------------------------------------------------
-- Singleton identity record
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  headline text not null,
  short_bio text,
  long_bio text,
  email text not null,
  location text,
  github_url text,
  linkedin_url text,
  avatar_url text,
  resume_url text,
  availability text,
  interests text[] not null default '{}',
  research_interests text[] not null default '{}',
  learning_goals text,
  career_goals text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Content tables
-- ---------------------------------------------------------------------
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  department text,
  location text,
  start_year integer,
  end_year integer,
  is_current boolean not null default false,
  result text,
  result_scale text,
  description text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('Programming', 'Database', 'Design Tools', 'Research Interests')),
  level text not null default 'Beginner' check (level in ('Beginner', 'Intermediate', 'Advanced')),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists skills_name_category_key
  on public.skills (lower(name), category);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  tagline text,
  summary text,
  description text,
  category text,
  technologies text[] not null default '{}',
  github_url text,
  live_url text,
  cover_image_url text,
  project_status text check (project_status in ('in_progress', 'completed', 'archived')),
  started_on date,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists project_images_project_idx on public.project_images (project_id);

create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  authors text[] not null default '{}',
  venue text,
  publication_year integer,
  doi text,
  abstract text,
  keywords text[] not null default '{}',
  pdf_url text,
  publication_url text,
  poster_url text,
  presentation_url text,
  publication_status text not null default 'published'
    check (publication_status in ('published', 'under_review', 'preprint', 'conference', 'journal')),
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.thesis (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  research_area text,
  supervisor text,
  description text,
  abstract text,
  thesis_status text not null default 'ongoing'
    check (thesis_status in ('ongoing', 'under_review', 'submitted', 'defended', 'completed')),
  started_year integer,
  expected_year integer,
  document_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text,
  issue_date date,
  category text not null default 'Online Course Certificates'
    check (category in (
      'Academic Certificates',
      'Online Course Certificates',
      'Workshop Certificates',
      'Training Certificates',
      'Competition Certificates',
      'Participation Certificates',
      'Research Certificates',
      'Other Achievements'
    )),
  description text,
  file_url text,
  verification_url text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuer text,
  achieved_on date,
  category text not null default 'Presentation',
  description text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.design_works (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text,
  description text,
  category text not null check (category in (
    'UI/UX Design',
    'Graphic Design',
    'Academic & Research Design',
    'Other Creative Work'
  )),
  tools text[] not null default '{}',
  objectives text[] not null default '{}',
  process text[] not null default '{}',
  cover_image_url text,
  figma_url text,
  source_url text,
  live_url text,
  created_on date,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.design_work_images (
  id uuid primary key default gen_random_uuid(),
  design_work_id uuid not null references public.design_works (id) on delete cascade,
  url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists design_work_images_work_idx on public.design_work_images (design_work_id);

create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  organization text not null,
  kind text not null default 'Membership',
  start_date date,
  end_date date,
  is_current boolean not null default false,
  description text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  event_date date,
  location text,
  role text,
  description text,
  image_url text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  path text not null,
  url text,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid references public.admins (id) on delete set null,
  created_at timestamptz not null default now(),
  unique (bucket, path)
);

create index if not exists media_assets_bucket_idx on public.media_assets (bucket, created_at desc);

create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_set_updated_at on public.site_settings;
create trigger site_settings_set_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  is_read boolean not null default false,
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_idx on public.contact_messages (created_at desc);

create table if not exists public.admin_activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admins (id) on delete set null,
  admin_email text,
  action text not null,
  entity text,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_logs_created_idx on public.admin_activity_logs (created_at desc);

-- ---------------------------------------------------------------------
-- updated_at triggers for content tables
-- ---------------------------------------------------------------------
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'education', 'skills', 'projects', 'publications', 'thesis',
    'certificates', 'achievements', 'design_works', 'experiences',
    'activities', 'site_settings'
  ]
  loop
    execute format(
      'drop trigger if exists %I_set_updated_at on public.%I;
       create trigger %I_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at();',
      tbl, tbl, tbl, tbl
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- Admin check helpers (SECURITY DEFINER avoids recursive RLS)
-- ---------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where a.user_id = auth.uid()
      and a.is_active = true
  );
$$;

create or replace function public.is_email_admin(candidate text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admins a
    where lower(a.email) = lower(candidate)
      and a.is_active = true
  );
$$;

-- Prevent removing the last active administrator.
create or replace function public.protect_last_active_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  remaining integer;
begin
  if (tg_op = 'DELETE') then
    if old.is_active then
      select count(*) into remaining from public.admins where is_active = true and id <> old.id;
      if remaining = 0 then
        raise exception 'At least one active administrator must remain.';
      end if;
    end if;
    return old;
  end if;

  if old.is_active and new.is_active = false then
    select count(*) into remaining from public.admins where is_active = true and id <> old.id;
    if remaining = 0 then
      raise exception 'At least one active administrator must remain.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists admins_protect_last on public.admins;
create trigger admins_protect_last
  before update or delete on public.admins
  for each row execute function public.protect_last_active_admin();
