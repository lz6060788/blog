CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`createdAt` text DEFAULT '2026-02-27T06:29:09.450Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-02-27T06:29:09.450Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `post_tags` (
	`post_id` text NOT NULL,
	`tag_id` text NOT NULL,
	PRIMARY KEY(`post_id`, `tag_id`),
	FOREIGN KEY (`post_id`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`createdAt` text DEFAULT '2026-02-27T06:29:09.450Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-02-27T06:29:09.450Z' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tags_name_unique` ON `tags` (`name`);--> statement-breakpoint
CREATE UNIQUE INDEX `tags_slug_unique` ON `tags` (`slug`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
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
	`createdAt` text DEFAULT '2026-02-27T06:29:09.450Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-02-27T06:29:09.450Z' NOT NULL,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "title", "content", "excerpt", "published", "authorId", "categoryId", "read_time", "published_date", "createdAt", "updatedAt") SELECT "id", "title", "content", "excerpt", "published", "authorId", "categoryId", "read_time", "published_date", "createdAt", "updatedAt" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`blog_name` text DEFAULT 'My Blog' NOT NULL,
	`blog_description` text DEFAULT 'A personal blog' NOT NULL,
	`posts_per_page` integer DEFAULT 10 NOT NULL,
	`updatedAt` text DEFAULT '2026-02-27T06:29:09.451Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_settings`("id", "blog_name", "blog_description", "posts_per_page", "updatedAt") SELECT "id", "blog_name", "blog_description", "posts_per_page", "updatedAt" FROM `settings`;--> statement-breakpoint
DROP TABLE `settings`;--> statement-breakpoint
ALTER TABLE `__new_settings` RENAME TO `settings`;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` text,
	`image` text,
	`createdAt` text DEFAULT '2026-02-27T06:29:09.447Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-02-27T06:29:09.448Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt") SELECT "id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;