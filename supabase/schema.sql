-- Run this whole file once in Supabase: SQL Editor > New query > Run
create table profiles(id uuid primary key references auth.users on delete cascade,
 username text unique not null, full_name text, bio text default '', is_admin boolean default false,
 paypal text default '', kofi text default '', hero_since timestamptz, created_at timestamptz default now());
create table photos(id uuid primary key default gen_random_uuid(), owner uuid not null references profiles on delete cascade,
 title text not null, category text not null, path text not null, views int default 0, downloads int default 0, created_at timestamptz default now());
create table likes(photo_id uuid references photos on delete cascade, user_id uuid references profiles on delete cascade, primary key(photo_id,user_id));
create table follows(follower uuid references profiles on delete cascade, following uuid references profiles on delete cascade,
 primary key(follower,following), check(follower<>following));

create function handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin insert into profiles(id,username,full_name) values(new.id,lower(new.raw_user_meta_data->>'username'),new.raw_user_meta_data->>'full_name'); return new; end $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

create function is_admin() returns boolean language sql security definer stable set search_path=public as
$$ select coalesce((select is_admin from profiles where id=auth.uid()),false) $$;
create function increment_views(pid uuid) returns void language sql security definer set search_path=public as $$ update photos set views=views+1 where id=pid $$;
create function increment_downloads(pid uuid) returns void language sql security definer set search_path=public as $$ update photos set downloads=downloads+1 where id=pid $$;

alter table profiles enable row level security; alter table photos enable row level security;
alter table likes enable row level security; alter table follows enable row level security;
create policy "read profiles" on profiles for select using (true);
create policy "edit own profile" on profiles for update using (id=auth.uid());
revoke update on profiles from authenticated, anon;
grant update(full_name,bio,paypal,kofi) on profiles to authenticated;   -- users can never make themselves admin
create policy "read photos" on photos for select using (true);
create policy "add own photos" on photos for insert with check (owner=auth.uid());
create policy "delete own or admin" on photos for delete using (owner=auth.uid() or is_admin());
create policy "read likes" on likes for select using (true);
create policy "like as me" on likes for insert with check (user_id=auth.uid());
create policy "unlike as me" on likes for delete using (user_id=auth.uid());
create policy "read follows" on follows for select using (true);
create policy "follow as me" on follows for insert with check (follower=auth.uid());
create policy "unfollow as me" on follows for delete using (follower=auth.uid());

insert into storage.buckets(id,name,public) values('photos','photos',true) on conflict do nothing;
create policy "upload to own folder" on storage.objects for insert to authenticated
 with check (bucket_id='photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "delete own files" on storage.objects for delete to authenticated
 using (bucket_id='photos' and ((storage.foldername(name))[1]=auth.uid()::text or is_admin()));
create policy "public read photos" on storage.objects for select using (bucket_id='photos');
