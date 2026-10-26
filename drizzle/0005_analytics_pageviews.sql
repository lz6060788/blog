CREATE TABLE "analytics_pageviews" (
	"id" text PRIMARY KEY NOT NULL,
	"path" text NOT NULL,
	"visitor_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "analytics_pageviews_created_at_idx" ON "analytics_pageviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "analytics_pageviews_visitor_time_idx" ON "analytics_pageviews" USING btree ("visitor_hash","created_at");--> statement-breakpoint
CREATE INDEX "analytics_pageviews_path_time_idx" ON "analytics_pageviews" USING btree ("path","created_at");