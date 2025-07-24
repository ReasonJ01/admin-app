CREATE TABLE "service" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"duration" integer NOT NULL,
	"hash" text NOT NULL,
	"showOnWebsite" boolean DEFAULT true NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
