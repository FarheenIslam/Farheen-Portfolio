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
