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
