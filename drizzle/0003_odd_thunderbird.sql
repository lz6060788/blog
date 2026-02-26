CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`blog_name` text DEFAULT 'My Blog' NOT NULL,
	`blog_description` text DEFAULT 'A personal blog' NOT NULL,
	`posts_per_page` integer DEFAULT 10 NOT NULL,
	`updatedAt` text DEFAULT '2026-02-26T15:35:07.755Z' NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`excerpt` text,
	`published` integer DEFAULT false NOT NULL,
	`authorId` text NOT NULL,
	`createdAt` text DEFAULT '2026-02-26T15:35:07.755Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-02-26T15:35:07.755Z' NOT NULL,
	FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "title", "content", "excerpt", "published", "authorId", "createdAt", "updatedAt") SELECT "id", "title", "content", "excerpt", "published", "authorId", "createdAt", "updatedAt" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`emailVerified` text,
	`image` text,
	`createdAt` text DEFAULT '2026-02-26T15:35:07.752Z' NOT NULL,
	`updatedAt` text DEFAULT '2026-02-26T15:35:07.753Z' NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt") SELECT "id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;