PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`createdAt` text DEFAULT '2026-02-28T06:12:45.382Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-02-28T06:12:45.382Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_categories`("id", "name", "slug", "description", "createdAt", "updatedAt") SELECT "id", "name", "slug", "description", "createdAt", "updatedAt" FROM `categories`;--> statement-breakpoint
DROP TABLE `categories`;--> statement-breakpoint
ALTER TABLE `__new_categories` RENAME TO `categories`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
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
	`createdAt` text DEFAULT '2026-02-28T06:12:45.383Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-02-28T06:12:45.383Z' NOT NULL,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "title", "content", "excerpt", "published", "authorId", "categoryId", "read_time", "published_date", "createdAt", "updatedAt") SELECT "id", "title", "content", "excerpt", "published", "authorId", "categoryId", "read_time", "published_date", "createdAt", "updatedAt" FROM `posts`;--> statement-breakpoint
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
	`updatedAt` text DEFAULT '2026-02-28T06:12:45.384Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_settings`("id", "blog_name", "blog_description", "posts_per_page", "author_name", "author_avatar", "author_bio", "author_location", "author_zodiac", "author_email", "author_social_github", "author_social_twitter", "author_social_linkedin", "updatedAt") SELECT "id", "blog_name", "blog_description", "posts_per_page", "author_name", "author_avatar", "author_bio", "author_location", "author_zodiac", "author_email", "author_social_github", "author_social_twitter", "author_social_linkedin", "updatedAt" FROM `settings`;--> statement-breakpoint
DROP TABLE `settings`;--> statement-breakpoint
ALTER TABLE `__new_settings` RENAME TO `settings`;--> statement-breakpoint
CREATE TABLE `__new_tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`createdAt` text DEFAULT '2026-02-28T06:12:45.382Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-02-28T06:12:45.382Z' NOT NULL
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
	`createdAt` text DEFAULT '2026-02-28T06:12:45.379Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-02-28T06:12:45.380Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt") SELECT "id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;