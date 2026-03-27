CREATE TABLE "accounts" (
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" text,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "ai_call_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text,
	"model_config_id" text,
	"action" text NOT NULL,
	"provider" text,
	"model" text,
	"input_tokens" integer,
	"output_tokens" integer,
	"status" text NOT NULL,
	"error_message" text,
	"duration_ms" integer,
	"image_size" text,
	"image_format" text,
	"image_cost" integer,
	"created_at" text DEFAULT '2026-03-27T07:11:09.704Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_function_mappings" (
	"id" text PRIMARY KEY NOT NULL,
	"function_name" text NOT NULL,
	"model_config_id" text,
	"created_at" text DEFAULT '2026-03-27T07:11:09.704Z' NOT NULL,
	"updated_at" text DEFAULT '2026-03-27T07:11:09.704Z' NOT NULL,
	CONSTRAINT "ai_function_mappings_function_name_unique" UNIQUE("function_name")
);
--> statement-breakpoint
CREATE TABLE "ai_model_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"api_key_encrypted" text NOT NULL,
	"base_url" text,
	"max_tokens" integer DEFAULT 300 NOT NULL,
	"temperature" integer DEFAULT 7 NOT NULL,
	"capability_type" text DEFAULT 'text' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" text DEFAULT '2026-03-27T07:11:09.704Z' NOT NULL,
	"updated_at" text DEFAULT '2026-03-27T07:11:09.704Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"createdAt" text DEFAULT '2026-03-27T07:11:09.703Z' NOT NULL,
	"updatedAt" text DEFAULT '2026-03-27T07:11:09.703Z' NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name"),
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "file_uploads" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"filename" text NOT NULL,
	"size" integer NOT NULL,
	"mime_type" text NOT NULL,
	"uploader_id" text NOT NULL,
	"created_at" text DEFAULT '2026-03-27T07:11:09.705Z' NOT NULL,
	CONSTRAINT "file_uploads_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "playlist_songs" (
	"id" text PRIMARY KEY NOT NULL,
	"playlist_id" text NOT NULL,
	"song_id" text NOT NULL,
	"position" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cover_color" text DEFAULT '#6366f1' NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" text DEFAULT '2026-03-27T07:11:09.705Z' NOT NULL,
	"updated_at" text DEFAULT '2026-03-27T07:11:09.705Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"post_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "post_tags_post_id_tag_id_pk" PRIMARY KEY("post_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "posts" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"published" boolean DEFAULT false NOT NULL,
	"authorId" text NOT NULL,
	"categoryId" text,
	"read_time" integer DEFAULT 0 NOT NULL,
	"published_date" text,
	"cover_image_url" text,
	"ai_cover_status" text,
	"ai_cover_generated_at" text,
	"ai_cover_prompt" text,
	"createdAt" text DEFAULT '2026-03-27T07:11:09.704Z' NOT NULL,
	"updatedAt" text DEFAULT '2026-03-27T07:11:09.704Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" text PRIMARY KEY NOT NULL,
	"blog_name" text DEFAULT 'My Blog' NOT NULL,
	"blog_description" text DEFAULT 'A personal blog' NOT NULL,
	"posts_per_page" integer DEFAULT 10 NOT NULL,
	"author_name" text DEFAULT 'Alex Chen' NOT NULL,
	"author_avatar" text DEFAULT 'https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=c0aede' NOT NULL,
	"author_bio" text DEFAULT 'Designer & Developer crafting digital experiences with code and creativity.' NOT NULL,
	"author_location" text DEFAULT 'San Francisco, CA' NOT NULL,
	"author_zodiac" text DEFAULT 'Scorpio ♏' NOT NULL,
	"author_email" text DEFAULT 'alex@example.com' NOT NULL,
	"author_social_github" text DEFAULT 'github.com/alexchen',
	"author_social_twitter" text DEFAULT 'twitter.com/alexchen',
	"author_social_linkedin" text,
	"updatedAt" text DEFAULT '2026-03-27T07:11:09.705Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "songs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"album" text,
	"duration" integer NOT NULL,
	"audio_url" text NOT NULL,
	"lyrics" text,
	"file_size" integer,
	"file_format" text,
	"upload_status" text DEFAULT 'pending' NOT NULL,
	"metadata" text,
	"created_at" text DEFAULT '2026-03-27T07:11:09.705Z' NOT NULL,
	"updated_at" text DEFAULT '2026-03-27T07:11:09.705Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"createdAt" text DEFAULT '2026-03-27T07:11:09.703Z' NOT NULL,
	"updatedAt" text DEFAULT '2026-03-27T07:11:09.703Z' NOT NULL,
	CONSTRAINT "tags_name_unique" UNIQUE("name"),
	CONSTRAINT "tags_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" text,
	"image" text,
	"createdAt" text DEFAULT '2026-03-27T07:11:09.700Z' NOT NULL,
	"updatedAt" text DEFAULT '2026-03-27T07:11:09.701Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_token" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" text NOT NULL,
	CONSTRAINT "verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_call_logs" ADD CONSTRAINT "ai_call_logs_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_call_logs" ADD CONSTRAINT "ai_call_logs_model_config_id_ai_model_configs_id_fk" FOREIGN KEY ("model_config_id") REFERENCES "public"."ai_model_configs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_function_mappings" ADD CONSTRAINT "ai_function_mappings_model_config_id_ai_model_configs_id_fk" FOREIGN KEY ("model_config_id") REFERENCES "public"."ai_model_configs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "file_uploads" ADD CONSTRAINT "file_uploads_uploader_id_users_id_fk" FOREIGN KEY ("uploader_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_songs" ADD CONSTRAINT "playlist_songs_playlist_id_playlists_id_fk" FOREIGN KEY ("playlist_id") REFERENCES "public"."playlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "playlist_songs" ADD CONSTRAINT "playlist_songs_song_id_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_authorId_users_id_fk" FOREIGN KEY ("authorId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_playlist_song" ON "playlist_songs" USING btree ("playlist_id","song_id");