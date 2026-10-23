CREATE TABLE "analytics_events" (
	"id" text PRIMARY KEY NOT NULL,
	"visit_id" text NOT NULL,
	"session_id" text NOT NULL,
	"type" text NOT NULL,
	"path" text NOT NULL,
	"referrer" text NOT NULL,
	"device" text NOT NULL,
	"duration_ms" integer DEFAULT 0 NOT NULL,
	"depth" integer DEFAULT 0 NOT NULL,
	"target" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "analytics_events_created_at_idx" ON "analytics_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_session_time_idx" ON "analytics_events" USING btree ("session_id","created_at");--> statement-breakpoint
CREATE INDEX "analytics_events_path_time_idx" ON "analytics_events" USING btree ("path","created_at");