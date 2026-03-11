PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ai_call_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text,
	`model_config_id` text,
	`action` text NOT NULL,
	`provider` text,
	`model` text,
	`input_tokens` integer,
	`output_tokens` integer,
	`status` text NOT NULL,
	`error_message` text,
	`duration_ms` integer,
	`image_size` text,
	`image_format` text,
	`image_cost` integer,
	`created_at` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`model_config_id`) REFERENCES `ai_model_configs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_ai_call_logs`("id", "post_id", "model_config_id", "action", "provider", "model", "input_tokens", "output_tokens", "status", "error_message", "duration_ms", "image_size", "image_format", "image_cost", "created_at") SELECT "id", "post_id", "model_config_id", "action", "provider", "model", "input_tokens", "output_tokens", "status", "error_message", "duration_ms", "image_size", "image_format", "image_cost", "created_at" FROM `ai_call_logs`;--> statement-breakpoint
DROP TABLE `ai_call_logs`;--> statement-breakpoint
ALTER TABLE `__new_ai_call_logs` RENAME TO `ai_call_logs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_ai_function_mappings` (
	`id` text PRIMARY KEY NOT NULL,
	`function_name` text NOT NULL,
	`model_config_id` text,
	`created_at` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL,
	`updated_at` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL,
	FOREIGN KEY (`model_config_id`) REFERENCES `ai_model_configs`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_ai_function_mappings`("id", "function_name", "model_config_id", "created_at", "updated_at") SELECT "id", "function_name", "model_config_id", "created_at", "updated_at" FROM `ai_function_mappings`;--> statement-breakpoint
DROP TABLE `ai_function_mappings`;--> statement-breakpoint
ALTER TABLE `__new_ai_function_mappings` RENAME TO `ai_function_mappings`;--> statement-breakpoint
CREATE UNIQUE INDEX `ai_function_mappings_function_name_unique` ON `ai_function_mappings` (`function_name`);--> statement-breakpoint
CREATE TABLE `__new_ai_model_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`provider` text NOT NULL,
	`model` text NOT NULL,
	`api_key_encrypted` text NOT NULL,
	`base_url` text,
	`max_tokens` integer DEFAULT 300 NOT NULL,
	`temperature` integer DEFAULT 7 NOT NULL,
	`capability_type` text DEFAULT 'text' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL,
	`updated_at` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_ai_model_configs`("id", "name", "provider", "model", "api_key_encrypted", "base_url", "max_tokens", "temperature", "capability_type", "enabled", "created_at", "updated_at") SELECT "id", "name", "provider", "model", "api_key_encrypted", "base_url", "max_tokens", "temperature", "capability_type", "enabled", "created_at", "updated_at" FROM `ai_model_configs`;--> statement-breakpoint
DROP TABLE `ai_model_configs`;--> statement-breakpoint
ALTER TABLE `__new_ai_model_configs` RENAME TO `ai_model_configs`;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`createdAt` text DEFAULT '2026-03-11T03:11:49.609Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-03-11T03:11:49.609Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "slug", "description", "createdAt", "updatedAt") SELECT "id", "name", "slug", "description", "createdAt", "updatedAt" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `__new_file_uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`filename` text NOT NULL,
	`size` integer NOT NULL,
	`mime_type` text NOT NULL,
	`uploader_id` text NOT NULL,
	`created_at` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL,
	FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_file_uploads`("id", "key", "filename", "size", "mime_type", "uploader_id", "created_at") SELECT "id", "key", "filename", "size", "mime_type", "uploader_id", "created_at" FROM `file_uploads`;--> statement-breakpoint
DROP TABLE `file_uploads`;--> statement-breakpoint
ALTER TABLE `__new_file_uploads` RENAME TO `file_uploads`;--> statement-breakpoint
CREATE UNIQUE INDEX `file_uploads_key_unique` ON `file_uploads` (`key`);--> statement-breakpoint
CREATE TABLE `__new_playlists` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`cover_color` text DEFAULT '#6366f1' NOT NULL,
	`is_public` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL,
	`updated_at` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_playlists`("id", "name", "description", "cover_color", "is_public", "created_at", "updated_at") SELECT "id", "name", "description", "cover_color", "is_public", "created_at", "updated_at" FROM `playlists`;--> statement-breakpoint
DROP TABLE `playlists`;--> statement-breakpoint
ALTER TABLE `__new_playlists` RENAME TO `playlists`;--> statement-breakpoint
CREATE TABLE `__new_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`published` integer DEFAULT false NOT NULL,
	`authorId` text NOT NULL,
	`categoryId` text,
	`read_time` integer DEFAULT 0 NOT NULL,
	`published_date` text,
	`cover_image_url` text,
	`ai_cover_status` text,
	`ai_cover_generated_at` text,
	`ai_cover_prompt` text,
	`createdAt` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "title", "content", "excerpt", "published", "authorId", "categoryId", "read_time", "published_date", "cover_image_url", "ai_cover_status", "ai_cover_generated_at", "ai_cover_prompt", "createdAt", "updatedAt") SELECT "id", "title", "content", "excerpt", "published", "authorId", "categoryId", "read_time", "published_date", "cover_image_url", "ai_cover_status", "ai_cover_generated_at", "ai_cover_prompt", "createdAt", "updatedAt" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
CREATE TABLE `__new_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`blog_name` text DEFAULT 'My Blog' NOT NULL,
	`blog_description` text DEFAULT 'A personal blog' NOT NULL,
	`posts_per_page` integer DEFAULT 10 NOT NULL,
	`author_name` text DEFAULT 'Alex Chen' NOT NULL,
	`author_avatar` text DEFAULT 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=c0aede' NOT NULL,
	`author_bio` text DEFAULT 'Designer & Developer crafting digital experiences with code and creativity.' NOT NULL,
	`author_location` text DEFAULT 'San Francisco, CA' NOT NULL,
	`author_zodiac` text DEFAULT 'Scorpio ♏' NOT NULL,
	`author_email` text DEFAULT 'alex@example.com' NOT NULL,
	`author_social_github` text DEFAULT 'github.com/alexchen',
	`author_social_twitter` text DEFAULT 'twitter.com/alexchen',
	`author_social_linkedin` text,
	`updatedAt` text DEFAULT '2026-03-11T03:11:49.611Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_settings`("id", "blog_name", "blog_description", "posts_per_page", "author_name", "author_avatar", "author_bio", "author_location", "author_zodiac", "author_email", "author_social_github", "author_social_twitter", "author_social_linkedin", "updatedAt") SELECT "id", "blog_name", "blog_description", "posts_per_page", "author_name", "author_avatar", "author_bio", "author_location", "author_zodiac", "author_email", "author_social_github", "author_social_twitter", "author_social_linkedin", "updatedAt" FROM `settings`;--> statement-breakpoint
DROP TABLE `settings`;--> statement-breakpoint
ALTER TABLE `__new_settings` RENAME TO `settings`;--> statement-breakpoint
CREATE TABLE `__new_songs` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`artist` text NOT NULL,
	`album` text,
	`duration` integer NOT NULL,
	`audio_url` text NOT NULL,
	`lyrics` text,
	`file_size` integer,
	`file_format` text,
	`upload_status` text DEFAULT 'pending' NOT NULL,
	`metadata` text,
	`created_at` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL,
	`updated_at` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_songs`("id", "title", "artist", "album", "duration", "audio_url", "lyrics", "file_size", "file_format", "upload_status", "metadata", "created_at", "updated_at") SELECT "id", "title", "artist", "album", "duration", "audio_url", "lyrics", "file_size", "file_format", "upload_status", "metadata", "created_at", "updated_at" FROM `songs`;--> statement-breakpoint
DROP TABLE `songs`;--> statement-breakpoint
ALTER TABLE `__new_songs` RENAME TO `songs`;--> statement-breakpoint
CREATE TABLE `__new_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`createdAt` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-03-11T03:11:49.610Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_tags`("id", "name", "slug", "createdAt", "updatedAt") SELECT "id", "name", "slug", "createdAt", "updatedAt" FROM `tags`;--> statement-breakpoint
DROP TABLE `tags`;--> statement-breakpoint
ALTER TABLE `__new_tags` RENAME TO `tags`;--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` text,
	`image` text,
	`createdAt` text DEFAULT '2026-03-11T03:11:49.608Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-03-11T03:11:49.609Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt") SELECT "id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;