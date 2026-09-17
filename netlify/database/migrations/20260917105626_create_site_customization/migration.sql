CREATE TABLE "site_customization" (
	"id" integer PRIMARY KEY,
	"settings" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
