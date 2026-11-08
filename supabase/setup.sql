-- =====================================================================
-- One-shot Supabase setup for the portfolio CMS.
-- Paste this whole file into Supabase -> SQL Editor -> New query -> Run.
-- It applies the three migrations in order, inserts the verified seed data,
-- and then (bottom of the file) promotes your own auth account to administrator.
-- Safe to re-run: migrations use IF NOT EXISTS and drop/recreate their triggers
-- and policies, and the seed inserts use ON CONFLICT.
-- =====================================================================


-- =====================================================================
-- supabase/migrations/0001_schema.sql
-- =====================================================================
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


-- =====================================================================
-- supabase/migrations/0002_rls.sql
-- =====================================================================
-- =====================================================================
-- Row Level Security
--   * anonymous / public  -> read only published content
--   * authenticated admin -> full CRUD on content
--   * every admin is equal (single is_admin() check, no role hierarchy)
-- =====================================================================

alter table public.admins enable row level security;
alter table public.admin_invites enable row level security;
alter table public.profiles enable row level security;
alter table public.education enable row level security;
alter table public.skills enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.publications enable row level security;
alter table public.thesis enable row level security;
alter table public.certificates enable row level security;
alter table public.achievements enable row level security;
alter table public.design_works enable row level security;
alter table public.design_work_images enable row level security;
alter table public.experiences enable row level security;
alter table public.activities enable row level security;
alter table public.media_assets enable row level security;
alter table public.site_settings enable row level security;
alter table public.contact_messages enable row level security;
alter table public.admin_activity_logs enable row level security;

-- ---------------------------------------------------------------------
-- Helper macro pattern: public read of published rows + full admin access
-- ---------------------------------------------------------------------
do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'education', 'skills', 'projects', 'publications', 'thesis',
    'certificates', 'achievements', 'design_works', 'experiences', 'activities'
  ]
  loop
    execute format('drop policy if exists %I_public_read on public.%I;', tbl, tbl);
    execute format(
      'create policy %I_public_read on public.%I for select to anon, authenticated
       using (is_published = true or public.is_admin());',
      tbl, tbl
    );

    execute format('drop policy if exists %I_admin_all on public.%I;', tbl, tbl);
    execute format(
      'create policy %I_admin_all on public.%I for all to authenticated
       using (public.is_admin()) with check (public.is_admin());',
      tbl, tbl
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------
-- profiles (single identity row, always public)
-- ---------------------------------------------------------------------
drop policy if exists profiles_public_read on public.profiles;
create policy profiles_public_read on public.profiles
  for select to anon, authenticated using (true);

drop policy if exists profiles_admin_write on public.profiles;
create policy profiles_admin_write on public.profiles
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- project_images (visible when the parent project is visible)
-- ---------------------------------------------------------------------
drop policy if exists project_images_public_read on public.project_images;
create policy project_images_public_read on public.project_images
  for select to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.projects p
      where p.id = project_images.project_id and p.is_published = true
    )
  );

drop policy if exists project_images_admin_all on public.project_images;
create policy project_images_admin_all on public.project_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- design_work_images
-- ---------------------------------------------------------------------
drop policy if exists design_work_images_public_read on public.design_work_images;
create policy design_work_images_public_read on public.design_work_images
  for select to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.design_works d
      where d.id = design_work_images.design_work_id and d.is_published = true
    )
  );

drop policy if exists design_work_images_admin_all on public.design_work_images;
create policy design_work_images_admin_all on public.design_work_images
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- site_settings (public read, admin write)
-- ---------------------------------------------------------------------
drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists site_settings_admin_all on public.site_settings;
create policy site_settings_admin_all on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- contact_messages: anyone may submit, only admins may read
-- ---------------------------------------------------------------------
drop policy if exists contact_messages_public_insert on public.contact_messages;
create policy contact_messages_public_insert on public.contact_messages
  for insert to anon, authenticated
  with check (
    length(name) between 2 and 120
    and length(email) between 5 and 200
    and email like '%_@_%._%'
    and length(message) between 10 and 4000
  );

drop policy if exists contact_messages_admin_all on public.contact_messages;
create policy contact_messages_admin_all on public.contact_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- admins: every admin can manage administrators, but the database
-- trigger prevents deleting or deactivating the last active one.
-- ---------------------------------------------------------------------
drop policy if exists admins_admin_read on public.admins;
create policy admins_admin_read on public.admins
  for select to authenticated using (public.is_admin() or user_id = auth.uid());

drop policy if exists admins_admin_write on public.admins;
create policy admins_admin_write on public.admins
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- admin_invites
-- ---------------------------------------------------------------------
drop policy if exists admin_invites_admin_all on public.admin_invites;
create policy admin_invites_admin_all on public.admin_invites
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- activity logs: append-only for admins (no update/delete policy)
-- ---------------------------------------------------------------------
drop policy if exists activity_logs_admin_read on public.admin_activity_logs;
create policy activity_logs_admin_read on public.admin_activity_logs
  for select to authenticated using (public.is_admin());

drop policy if exists activity_logs_admin_insert on public.admin_activity_logs;
create policy activity_logs_admin_insert on public.admin_activity_logs
  for insert to authenticated with check (public.is_admin());

-- ---------------------------------------------------------------------
-- media_assets
-- ---------------------------------------------------------------------
drop policy if exists media_assets_admin_all on public.media_assets;
create policy media_assets_admin_all on public.media_assets
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Invite helpers
-- ---------------------------------------------------------------------
create or replace function public.get_admin_invite(p_token uuid)
returns table (email text, full_name text, expires_at timestamptz, accepted_at timestamptz)
language sql
stable
security definer
set search_path = public
as $$
  select i.email, i.full_name, i.expires_at, i.accepted_at
  from public.admin_invites i
  where i.token = p_token
  limit 1;
$$;

create or replace function public.accept_pending_admin_invite()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_invite public.admin_invites;
begin
  if v_uid is null then
    return false;
  end if;

  select u.email into v_email from auth.users u where u.id = v_uid;
  if v_email is null then
    return false;
  end if;

  if exists (
    select 1 from public.admins a where a.user_id = v_uid and a.is_active = true
  ) then
    return true;
  end if;

  select * into v_invite
  from public.admin_invites i
  where lower(i.email) = lower(v_email)
    and i.accepted_at is null
    and i.expires_at > now()
  order by i.created_at desc
  limit 1;

  if v_invite.id is null then
    return false;
  end if;

  insert into public.admins (user_id, email, full_name, invited_by)
  values (v_uid, lower(v_email), v_invite.full_name, v_invite.invited_by)
  on conflict (user_id) do update
    set is_active = true, updated_at = now();

  update public.admin_invites
    set accepted_at = now()
    where id = v_invite.id;

  return true;
end;
$$;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_email_admin(text) to anon, authenticated;
grant execute on function public.get_admin_invite(uuid) to anon, authenticated;
grant execute on function public.accept_pending_admin_invite() to authenticated;


-- =====================================================================
-- supabase/migrations/0003_storage.sql
-- =====================================================================
-- =====================================================================
-- Supabase Storage
--   portfolio-images    public read  | admin write   (images)
--   portfolio-documents public read  | admin write   (published PDFs)
--   private-documents   admin only   | signed URLs   (restricted files)
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'portfolio-images',
    'portfolio-images',
    true,
    5242880, -- 5 MB
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'portfolio-documents',
    'portfolio-documents',
    true,
    10485760, -- 10 MB
    array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'private-documents',
    'private-documents',
    false,
    10485760,
    array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read for the two public buckets
drop policy if exists "portfolio public read" on storage.objects;
create policy "portfolio public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('portfolio-images', 'portfolio-documents'));

-- Administrators manage every portfolio bucket
drop policy if exists "portfolio admin insert" on storage.objects;
create policy "portfolio admin insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('portfolio-images', 'portfolio-documents', 'private-documents')
    and public.is_admin()
  );

drop policy if exists "portfolio admin update" on storage.objects;
create policy "portfolio admin update" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('portfolio-images', 'portfolio-documents', 'private-documents')
    and public.is_admin()
  )
  with check (
    bucket_id in ('portfolio-images', 'portfolio-documents', 'private-documents')
    and public.is_admin()
  );

drop policy if exists "portfolio admin delete" on storage.objects;
create policy "portfolio admin delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('portfolio-images', 'portfolio-documents', 'private-documents')
    and public.is_admin()
  );

-- Private bucket objects are readable only by administrators.
-- Public files are served through signed URLs generated server-side.
drop policy if exists "private documents admin read" on storage.objects;
create policy "private documents admin read" on storage.objects
  for select to authenticated
  using (bucket_id = 'private-documents' and public.is_admin());


-- =====================================================================
-- supabase/seed.sql
-- =====================================================================
-- =====================================================================
-- Seed data: only verified facts supplied by the portfolio owner.
-- Safe to run once on a fresh database. Existing rows are never overwritten.
--
-- BEFORE YOU RUN THIS:
--   1) Create your account in Supabase → Authentication → Users → Add user
--      (email + password). Confirm the email if confirmation is enabled.
--   2) Run the block at the bottom of this file to make that user an admin.
--   3) Sign in at /admin/login.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Profile
-- ---------------------------------------------------------------------
insert into public.profiles (
  id, full_name, headline, short_bio, long_bio, email, location,
  github_url, linkedin_url, avatar_url, availability,
  interests, research_interests, learning_goals, career_goals
)
values (
  '9f000000-0000-4000-8000-000000000001',
  'Most. Farheen Islam Badhon',
  'Computer Science & Engineering undergraduate at IUBAT · AI, machine learning and computer vision · UI/UX and visual design',
  'I am a Computer Science and Engineering undergraduate at IUBAT, Bangladesh, expecting to graduate in 2027. I am a beginner-level developer building my foundations in programming and databases, with a growing interest in artificial intelligence, machine learning and computer vision - and a parallel love for UI/UX and visual design.',
  E'I am currently studying for a BSc in Computer Science and Engineering at the International University of Business Agriculture and Technology (IUBAT) in Dhaka, Bangladesh, with an expected graduation in 2027. Before university I completed my HSC at Rajuk Uttara Model College and my SSC at Khwaja Yunus Ali Laboratory School and College, both with a GPA of 5.00.\n\nI am at the beginning of my technical journey. My coursework and self-study have introduced me to programming in C, C++, C#, Python, JavaScript and PHP, to relational and document databases, and to design tools such as Figma, Adobe XD and Photopea. I am honest about my level: I am a learner, not a senior engineer, and this portfolio documents work in progress rather than claiming expertise I do not have.\n\nMy academic interests are in artificial intelligence, machine learning, deep learning, computer vision and deepfake detection, and my undergraduate thesis focuses on image-based deepfake detection. Alongside engineering I enjoy design work - interface design, posters, academic diagrams and infographics - and I am interested in research collaboration, research assistant opportunities, fully funded postgraduate study, and remote work.',
  'farheenislam2003@gmail.com',
  'Bangladesh',
  'https://github.com/FarheenIslam',
  'https://www.linkedin.com/in/farheen-islam-badhon-10b17b259',
  null,
  'Open to research collaboration and remote opportunities',
  array[
    'Software Development', 'Artificial Intelligence', 'Machine Learning',
    'Deep Learning', 'Computer Vision', 'Deepfake Detection', 'UI/UX Design',
    'Research Collaboration', 'Research Assistant Opportunities',
    'Fully Funded Higher Education & Direct PhD', 'Remote Jobs & Freelancing'
  ],
  array[
    'Artificial Intelligence', 'Machine Learning', 'Deep Learning',
    'Computer Vision', 'Human-Computer Interaction', 'Deepfake Detection'
  ],
  'Strengthening my programming and data-structure fundamentals, practising machine-learning workflows end to end, learning computer-vision and deepfake-detection research methods, and improving my UI/UX craft through real design work.',
  'To grow into a researcher and engineer working on trustworthy computer vision and deepfake detection, while contributing to research teams, pursuing fully funded graduate study, and taking on remote software or design work.'
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Education
-- ---------------------------------------------------------------------
insert into public.education (id, institution, degree, department, location, start_year, end_year, is_current, result, result_scale, description, sort_order)
values
  ('e0000000-0000-4000-8000-000000000001', 'International University of Business Agriculture and Technology (IUBAT)', 'BSc in Computer Science and Engineering', 'Department of Computer Science and Engineering', 'Dhaka, Bangladesh', null, 2027, true, null, null, 'Undergraduate degree in Computer Science and Engineering. Expected graduation in 2027.', 1),
  ('e0000000-0000-4000-8000-000000000002', 'Rajuk Uttara Model College', 'Higher Secondary Certificate (HSC)', 'Science', 'Dhaka, Bangladesh', null, 2021, false, '5.00', '5.00', 'Completed HSC with a GPA of 5.00 in 2021.', 2),
  ('e0000000-0000-4000-8000-000000000003', 'Khwaja Yunus Ali Laboratory School and College', 'Secondary School Certificate (SSC)', 'Science', 'Bangladesh', null, 2019, false, '5.00', '5.00', 'Completed SSC with a GPA of 5.00 in 2019.', 3)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Skills (honest "Beginner" labels; edit levels from the dashboard)
-- ---------------------------------------------------------------------
insert into public.skills (name, category, level, sort_order)
values
  ('C', 'Programming', 'Beginner', 1),
  ('C++', 'Programming', 'Beginner', 2),
  ('C#', 'Programming', 'Beginner', 3),
  ('Python', 'Programming', 'Beginner', 4),
  ('JavaScript', 'Programming', 'Beginner', 5),
  ('PHP', 'Programming', 'Beginner', 6),
  ('MySQL', 'Database', 'Beginner', 7),
  ('MongoDB', 'Database', 'Beginner', 8),
  ('Supabase', 'Database', 'Beginner', 9),
  ('Figma', 'Design Tools', 'Beginner', 10),
  ('Adobe XD', 'Design Tools', 'Beginner', 11),
  ('Photopea', 'Design Tools', 'Beginner', 12),
  ('Canva', 'Design Tools', 'Beginner', 13),
  ('Draw.io', 'Design Tools', 'Beginner', 14),
  ('Artificial Intelligence', 'Research Interests', 'Beginner', 15),
  ('Machine Learning', 'Research Interests', 'Beginner', 16),
  ('Deep Learning', 'Research Interests', 'Beginner', 17),
  ('Computer Vision', 'Research Interests', 'Beginner', 18),
  ('HCI', 'Research Interests', 'Beginner', 19),
  ('Deepfake Detection', 'Research Interests', 'Beginner', 20)
on conflict do nothing;

-- ---------------------------------------------------------------------
-- Projects (only the supplied titles, repositories and status)
-- ---------------------------------------------------------------------
insert into public.projects (id, slug, title, tagline, summary, category, technologies, github_url, project_status, is_featured, sort_order)
values
  ('a0000000-0000-4000-8000-000000000001', 'inventorypro-commerce', 'InventoryPro Commerce', 'Inventory and commerce management', 'An inventory and commerce management project. Full write-up, screenshots and technology list are maintained from the admin dashboard.', 'Software Development', '{}', 'https://github.com/FarheenIslam/inventorypro-commerce', null, true, 1),
  ('a0000000-0000-4000-8000-000000000002', 'alumni-management-system', 'Alumni Management System', 'Alumni records and engagement', 'A management system for alumni records. Full write-up, screenshots and technology list are maintained from the admin dashboard.', 'Software Development', '{}', 'https://github.com/FarheenIslam/alumni_managemnt', null, true, 2),
  ('a0000000-0000-4000-8000-000000000003', 'courier-parcel-delivery-analytics', 'Courier and Parcel Delivery Analytics System', 'Delivery analytics', 'An analytics system for courier and parcel delivery. Full write-up, screenshots and technology list are maintained from the admin dashboard.', 'Data & Analytics', '{}', 'https://github.com/FarheenIslam/cpds', null, false, 3),
  ('a0000000-0000-4000-8000-000000000004', 'routeflow-bus-counter-booking', 'Bus Counter & Seat Booking System (RouteFlow)', 'Seat booking, in progress', 'A bus counter and seat booking system. Currently in progress; details, screenshots and technology list are maintained from the admin dashboard.', 'Software Development', '{}', 'https://github.com/FarheenIslam/routeflow', 'in_progress', true, 4)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Publications (titles only; venues, years and DOIs left empty on purpose)
-- ---------------------------------------------------------------------
insert into public.publications (id, title, authors, keywords, publication_status, is_featured, sort_order)
values
  ('b0000000-0000-4000-8000-000000000001', 'Depression Detection from Code Mixed Bangla English Social Media Text', array['Most. Farheen Islam Badhon'], array['Depression Detection', 'Code-Mixed Text', 'Bangla', 'English', 'Social Media'], 'published', true, 1),
  ('b0000000-0000-4000-8000-000000000002', 'Evaluating ML Model Reliability in Medical Diagnosis with Data Splits and Noise', array['Most. Farheen Islam Badhon'], array['Machine Learning', 'Model Reliability', 'Medical Diagnosis', 'Data Splits', 'Noise'], 'published', false, 2),
  ('b0000000-0000-4000-8000-000000000003', 'A Real Time Automated Traffic Violations Detection System for Motorcycles Using YOLOR', array['Most. Farheen Islam Badhon'], array['YOLOR', 'Traffic Violation Detection', 'Motorcycles', 'Computer Vision', 'Real-Time'], 'published', false, 3)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Thesis
-- ---------------------------------------------------------------------
insert into public.thesis (id, title, research_area, description, thesis_status, expected_year, sort_order)
values
  ('c0000000-0000-4000-8000-000000000001', 'Image-Based Deepfake Detection', 'Computer Vision · Deepfake Detection', 'Ongoing undergraduate thesis on detecting image-based deepfakes. Methodology, results and artefacts will be published as the research progresses.', 'ongoing', 2027, 1)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Achievements / experience / activities
-- ---------------------------------------------------------------------
insert into public.achievements (id, title, achieved_on, category, description, is_featured, sort_order)
values
  ('d0000000-0000-4000-8000-000000000001', 'Humanitarian Poster Presentation', '2025-12-28', 'Presentation', 'Presented a poster at a humanitarian poster presentation event.', true, 1)
on conflict (id) do nothing;

insert into public.experiences (id, role, organization, kind, start_date, end_date, is_current, description, sort_order)
values
  ('f0000000-0000-4000-8000-000000000001', 'Member', 'IUBAT IT Society', 'Membership', '2023-01-01', '2024-12-31', false, 'Member of the IUBAT IT Society (2023-2024).', 1)
on conflict (id) do nothing;

insert into public.activities (id, title, event_date, role, description, sort_order)
values
  ('aa000000-0000-4000-8000-000000000001', 'Quiz of IIEC Innovation', '2025-11-29', 'Participant', 'Participated in the Quiz of IIEC Innovation.', 1),
  ('aa000000-0000-4000-8000-000000000002', 'Craft Your CV', '2025-12-04', 'Participant', 'Participated in the Craft Your CV session.', 2),
  ('aa000000-0000-4000-8000-000000000003', 'Humanitarian Poster Presentation', '2025-12-28', 'Presenter', 'Presented a poster at a humanitarian poster presentation event.', 3)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Website settings
-- ---------------------------------------------------------------------
insert into public.site_settings (key, value)
values
  ('site_title', '"Most. Farheen Islam Badhon"'::jsonb),
  ('site_tagline', '"Computer Science & Engineering undergraduate · AI & computer vision"'::jsonb),
  ('seo_description', '"Portfolio of Most. Farheen Islam Badhon, Computer Science and Engineering undergraduate at IUBAT, Bangladesh - projects, research on deepfake detection, certificates and design work."'::jsonb),
  ('contact_intro', '"For research collaboration, research assistant opportunities, fully funded graduate study or remote work, email me or use the form below."'::jsonb),
  ('show_design_gallery', 'true'::jsonb),
  ('footer_note', '"Built with Next.js, Supabase and care."'::jsonb)
on conflict (key) do nothing;

-- =====================================================================
-- STEP 2 - make your own account an administrator.
-- Replace the email below with the account you created in Supabase Auth.
-- =====================================================================
-- insert into public.admins (user_id, email, full_name)
-- select id, lower(email), 'Most. Farheen Islam Badhon'
-- from auth.users
-- where lower(email) = lower('farheenislam2003@gmail.com')
-- on conflict (user_id) do nothing;

