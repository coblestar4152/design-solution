-- =====================================================================
-- Design & Solution — Supabase schema
-- Run this whole file once in Supabase: SQL Editor -> New query -> paste -> Run
-- =====================================================================

-- ---------- ADMINS ----------
-- One row per authorized admin user. A Supabase Auth user can log into
-- the admin panel only if their auth.users.id also exists in this table.
create table if not exists admins (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

-- ---------- SITE SETTINGS ----------
-- Single-row table (id is always 1) holding global site content.
create table if not exists site_settings (
  id int primary key default 1,
  site_title text not null default 'Design & Solution',
  tagline text not null default 'Creative edits, Minecraft worlds & Discord communities — built to stand out.',
  about_text text not null default 'Design & Solution is a creative studio blending video editing, graphic design, Minecraft development, and Discord server craftsmanship into one team.',
  phone text default '+1 (555) 000-0000',
  whatsapp text default '15550000000',
  email text default 'hello@example.com',
  discord_invite text default 'https://discord.gg/example',
  logo_path text,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

insert into site_settings (id) values (1)
  on conflict (id) do nothing;

-- ---------- CATEGORIES ----------
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- SERVICES ----------
create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories (id) on delete cascade,
  name text not null,
  description text,
  image_path text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- PORTFOLIO PROJECTS ----------
create table if not exists portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (category in ('video-design', 'minecraft', 'discord')),
  image_path text,
  project_link text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ---------- TESTIMONIALS ----------
create table if not exists testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text,
  content text not null,
  rating int default 5 check (rating between 1 and 5),
  avatar_path text,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- =====================================================================
-- ROW LEVEL SECURITY
-- Public (anonymous) visitors can only READ content.
-- Only rows present in `admins` can write. There is no public sign-up
-- flow in this app, so the only way to become an admin is for you to
-- add a row here yourself (see the README / setup instructions).
-- =====================================================================

alter table admins enable row level security;
alter table site_settings enable row level security;
alter table categories enable row level security;
alter table services enable row level security;
alter table portfolio_projects enable row level security;
alter table testimonials enable row level security;

-- admins: nobody can read/write this table from the client at all except
-- via the checks embedded in the other policies below. We still allow an
-- authenticated user to check membership of their OWN id (used by the app
-- to verify admin status after login).
drop policy if exists "admins can read own row" on admins;
create policy "admins can read own row" on admins
  for select using (auth.uid() = id);

-- site_settings
drop policy if exists "public read settings" on site_settings;
create policy "public read settings" on site_settings
  for select using (true);

drop policy if exists "admin update settings" on site_settings;
create policy "admin update settings" on site_settings
  for update using (exists (select 1 from admins where admins.id = auth.uid()));

-- categories
drop policy if exists "public read categories" on categories;
create policy "public read categories" on categories
  for select using (true);

drop policy if exists "admin write categories" on categories;
create policy "admin write categories" on categories
  for all using (exists (select 1 from admins where admins.id = auth.uid()))
  with check (exists (select 1 from admins where admins.id = auth.uid()));

-- services
drop policy if exists "public read services" on services;
create policy "public read services" on services
  for select using (true);

drop policy if exists "admin write services" on services;
create policy "admin write services" on services
  for all using (exists (select 1 from admins where admins.id = auth.uid()))
  with check (exists (select 1 from admins where admins.id = auth.uid()));

-- portfolio_projects
drop policy if exists "public read portfolio" on portfolio_projects;
create policy "public read portfolio" on portfolio_projects
  for select using (true);

drop policy if exists "admin write portfolio" on portfolio_projects;
create policy "admin write portfolio" on portfolio_projects
  for all using (exists (select 1 from admins where admins.id = auth.uid()))
  with check (exists (select 1 from admins where admins.id = auth.uid()));

-- testimonials
drop policy if exists "public read testimonials" on testimonials;
create policy "public read testimonials" on testimonials
  for select using (true);

drop policy if exists "admin write testimonials" on testimonials;
create policy "admin write testimonials" on testimonials
  for all using (exists (select 1 from admins where admins.id = auth.uid()))
  with check (exists (select 1 from admins where admins.id = auth.uid()));

-- =====================================================================
-- STORAGE
-- One public bucket for every image the site uses (services, portfolio,
-- testimonial avatars, logo). Files are organized into folders by the
-- app itself (services/…, portfolio/…, testimonials/…, logo/…).
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('site-images', 'site-images', true)
on conflict (id) do nothing;

drop policy if exists "public read site images" on storage.objects;
create policy "public read site images" on storage.objects
  for select using (bucket_id = 'site-images');

drop policy if exists "admin upload site images" on storage.objects;
create policy "admin upload site images" on storage.objects
  for insert with check (
    bucket_id = 'site-images'
    and exists (select 1 from admins where admins.id = auth.uid())
  );

drop policy if exists "admin update site images" on storage.objects;
create policy "admin update site images" on storage.objects
  for update using (
    bucket_id = 'site-images'
    and exists (select 1 from admins where admins.id = auth.uid())
  );

drop policy if exists "admin delete site images" on storage.objects;
create policy "admin delete site images" on storage.objects
  for delete using (
    bucket_id = 'site-images'
    and exists (select 1 from admins where admins.id = auth.uid())
  );

-- =====================================================================
-- SEED DATA — the three service categories requested, pre-filled so the
-- site isn't empty on first load. Edit or delete any of this from the
-- admin panel afterwards.
-- =====================================================================

do $$
declare
  cat_video uuid;
  cat_mc uuid;
  cat_discord uuid;
begin
  -- Only seed if there are no categories yet, so re-running this script
  -- is safe and won't duplicate data.
  if (select count(*) from categories) = 0 then

    insert into categories (name, description, sort_order)
    values ('Video Editing & Graphic Design', 'Editing, motion graphics, thumbnails, banners, logos and social media design.', 1)
    returning id into cat_video;

    insert into categories (name, description, sort_order)
    values ('Minecraft Development', 'Skins, servers, texture packs, plugins, maps and optimization.', 2)
    returning id into cat_mc;

    insert into categories (name, description, sort_order)
    values ('Discord Development & Management', 'Server setup, custom bots, moderation, roles and ticket systems.', 3)
    returning id into cat_discord;

    insert into services (category_id, name, description, sort_order) values
      (cat_video, 'Professional Video Editing', 'Polished edits for any platform, from raw footage to final cut.', 1),
      (cat_video, 'YouTube Video Editing', 'Long-form editing tuned for retention and watch time.', 2),
      (cat_video, 'Short-Form Video Editing', 'Fast-paced edits built for TikTok, Reels and Shorts.', 3),
      (cat_video, 'Reels and Shorts Editing', 'Trend-aware vertical video editing that keeps viewers watching.', 4),
      (cat_video, 'Motion Graphics', 'Animated titles, lower-thirds and graphic elements.', 5),
      (cat_video, 'Thumbnail Design', 'Click-worthy thumbnails designed to boost click-through rate.', 6),
      (cat_video, 'Banner Design', 'Channel art, social banners and header graphics.', 7),
      (cat_video, 'Logo Design', 'Custom logos for brands, channels and communities.', 8),
      (cat_video, 'Social Media Designs', 'Post templates, carousels and story graphics.', 9),
      (cat_video, 'Promotional Videos', 'Short promotional and advertising videos.', 10),
      (cat_video, 'Other Graphic Design Services', 'Custom graphic design work outside the categories above.', 11);

    insert into services (category_id, name, description, sort_order) values
      (cat_mc, 'Minecraft Skins', 'Custom player skins designed to spec.', 1),
      (cat_mc, 'Minecraft Server Development', 'Custom game mechanics and server-side features.', 2),
      (cat_mc, 'Minecraft Texture Packs', 'Full or partial custom resource packs.', 3),
      (cat_mc, 'Animated Textures', 'Animated blocks, items and effects.', 4),
      (cat_mc, 'Minecraft Plugins', 'Custom plugins built for your server''s needs.', 5),
      (cat_mc, 'Custom Minecraft Maps', 'Hand-built worlds, adventure maps and builds.', 6),
      (cat_mc, 'Minecraft Server Setup', 'From-scratch server configuration and launch.', 7),
      (cat_mc, 'Minecraft Server Optimization', 'Performance tuning to cut lag and TPS drops.', 8),
      (cat_mc, 'Other Minecraft Development Services', 'Custom Minecraft work outside the categories above.', 9);

    insert into services (category_id, name, description, sort_order) values
      (cat_discord, 'Discord Server Development', 'End-to-end custom server builds.', 1),
      (cat_discord, 'Discord Server Setup', 'Channel structure, roles and permissions from scratch.', 2),
      (cat_discord, 'Discord Server Management', 'Ongoing hands-on management of your community.', 3),
      (cat_discord, 'Custom Discord Bots', 'Bots built around your server''s exact needs.', 4),
      (cat_discord, 'Bot Configuration', 'Setup and configuration of existing bots.', 5),
      (cat_discord, 'Server Security', 'Anti-raid, verification and security hardening.', 6),
      (cat_discord, 'Moderation Systems', 'Auto-moderation rules and moderation workflows.', 7),
      (cat_discord, 'Custom Roles and Permissions', 'Role hierarchies and permission structures.', 8),
      (cat_discord, 'Ticket Systems', 'Support ticket systems for member requests.', 9),
      (cat_discord, 'Other Discord Services', 'Custom Discord work outside the categories above.', 10);

  end if;
end $$;
