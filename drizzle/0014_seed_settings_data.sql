-- Seed settings table with initial data from config/site.ts
-- This migration inserts a default settings record if one doesn't exist

INSERT INTO settings (
  id,
  blog_name,
  blog_description,
  posts_per_page,
  author_name,
  author_avatar,
  author_bio,
  author_location,
  author_zodiac,
  author_email,
  author_social_github,
  author_social_twitter,
  author_social_linkedin,
  updatedAt
) VALUES (
  'default',
  'Irises Blog',
  'A personal blog',
  10,
  'Irises',
  'https://api.dicebear.com/7.x/notionists/svg?seed=Iris&backgroundColor=c0aede',
  'All things in the world are but fading blossoms; only the shadow of a dream remains true.',
  'HangZhou, China',
  'Capricorn ♑',
  'ir1seswhite@gmail.com',
  'https://github.com/lz6060788',
  NULL,
  NULL,
  datetime('now')
)
ON CONFLICT(id) DO UPDATE SET
  blog_name = excluded.blog_name,
  blog_description = excluded.blog_description,
  posts_per_page = excluded.posts_per_page,
  author_name = excluded.author_name,
  author_avatar = excluded.author_avatar,
  author_bio = excluded.author_bio,
  author_location = excluded.author_location,
  author_zodiac = excluded.author_zodiac,
  author_email = excluded.author_email,
  author_social_github = excluded.author_social_github,
  author_social_twitter = excluded.author_social_twitter,
  author_social_linkedin = excluded.author_social_linkedin,
  updatedAt = excluded.updatedAt;
