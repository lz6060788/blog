CREATE TABLE "post_draft_tags" (
	"draft_id" text NOT NULL,
	"tag_id" text NOT NULL,
	CONSTRAINT "post_draft_tags_draft_id_tag_id_pk" PRIMARY KEY("draft_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "post_drafts" (
	"id" text PRIMARY KEY NOT NULL,
	"post_id" text,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"excerpt" text,
	"author_id" text NOT NULL,
	"category_id" text,
	"series_id" text,
	"series_order" integer,
	"read_time" integer DEFAULT 0 NOT NULL,
	"cover_image_url" text,
	"ai_cover_status" text,
	"ai_cover_generated_at" text,
	"ai_cover_prompt" text,
	"created_at" text DEFAULT '2026-08-06T13:55:56.521Z' NOT NULL,
	"updated_at" text DEFAULT '2026-08-06T13:55:56.521Z' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"author_id" text NOT NULL,
	"created_at" text DEFAULT '2026-08-06T13:55:56.520Z' NOT NULL,
	"updated_at" text DEFAULT '2026-08-06T13:55:56.520Z' NOT NULL,
	CONSTRAINT "series_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "ai_call_logs" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T13:55:56.522Z';--> statement-breakpoint
ALTER TABLE "ai_function_mappings" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T13:55:56.522Z';--> statement-breakpoint
ALTER TABLE "ai_function_mappings" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T13:55:56.522Z';--> statement-breakpoint
ALTER TABLE "ai_model_configs" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T13:55:56.522Z';--> statement-breakpoint
ALTER TABLE "ai_model_configs" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T13:55:56.522Z';--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "createdAt" SET DEFAULT '2026-08-06T13:55:56.520Z';--> statement-breakpoint
ALTER TABLE "categories" ALTER COLUMN "updatedAt" SET DEFAULT '2026-08-06T13:55:56.520Z';--> statement-breakpoint
ALTER TABLE "file_uploads" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T13:55:56.522Z';--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T13:55:56.522Z';--> statement-breakpoint
ALTER TABLE "playlists" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T13:55:56.522Z';--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "createdAt" SET DEFAULT '2026-08-06T13:55:56.520Z';--> statement-breakpoint
ALTER TABLE "posts" ALTER COLUMN "updatedAt" SET DEFAULT '2026-08-06T13:55:56.520Z';--> statement-breakpoint
ALTER TABLE "settings" ALTER COLUMN "updatedAt" SET DEFAULT '2026-08-06T13:55:56.523Z';--> statement-breakpoint
ALTER TABLE "songs" ALTER COLUMN "created_at" SET DEFAULT '2026-08-06T13:55:56.522Z';--> statement-breakpoint
ALTER TABLE "songs" ALTER COLUMN "updated_at" SET DEFAULT '2026-08-06T13:55:56.522Z';--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "createdAt" SET DEFAULT '2026-08-06T13:55:56.520Z';--> statement-breakpoint
ALTER TABLE "tags" ALTER COLUMN "updatedAt" SET DEFAULT '2026-08-06T13:55:56.520Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "createdAt" SET DEFAULT '2026-08-06T13:55:56.513Z';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updatedAt" SET DEFAULT '2026-08-06T13:55:56.517Z';--> statement-breakpoint
ALTER TABLE "ai_call_logs" ADD COLUMN "draft_id" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "series_id" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "series_order" integer;--> statement-breakpoint
ALTER TABLE "post_draft_tags" ADD CONSTRAINT "post_draft_tags_draft_id_post_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."post_drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_draft_tags" ADD CONSTRAINT "post_draft_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_drafts" ADD CONSTRAINT "post_drafts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_drafts" ADD CONSTRAINT "post_drafts_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_drafts" ADD CONSTRAINT "post_drafts_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_drafts" ADD CONSTRAINT "post_drafts_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "post_drafts_post_id_unique" ON "post_drafts" USING btree ("post_id");--> statement-breakpoint
ALTER TABLE "ai_call_logs" ADD CONSTRAINT "ai_call_logs_draft_id_post_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."post_drafts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

-- 将旧模型中未发布的文章迁移为独立的新文章草稿。
INSERT INTO "post_drafts" (
	"id", "post_id", "title", "content", "excerpt", "author_id", "category_id",
	"read_time", "cover_image_url", "ai_cover_status", "ai_cover_generated_at",
	"ai_cover_prompt", "created_at", "updated_at"
)
SELECT
	"id", NULL, "title", "content", "excerpt", "authorId", "categoryId",
	"read_time", "cover_image_url", "ai_cover_status", "ai_cover_generated_at",
	"ai_cover_prompt", "createdAt", "updatedAt"
FROM "posts"
WHERE "published" = false;--> statement-breakpoint

INSERT INTO "post_draft_tags" ("draft_id", "tag_id")
SELECT "post_id", "tag_id"
FROM "post_tags"
WHERE "post_id" IN (SELECT "id" FROM "posts" WHERE "published" = false);--> statement-breakpoint

DELETE FROM "posts" WHERE "published" = false;
