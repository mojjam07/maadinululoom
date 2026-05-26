-- Storage bucket for avatars
-- Create bucket if not exists
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 1048576, array['image/png','image/jpeg','image/webp'])
on conflict (id) do nothing;

-- Avatar path convention: avatars/<user-uuid>/...
create policy "avatars_read" on storage.objects for select using (bucket_id = 'avatars');

create policy "avatars_upload_own" on storage.objects for insert with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "avatars_update_own" on storage.objects for update using (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);
