CREATE TABLE "booking_flow_option" (
	"id" text PRIMARY KEY NOT NULL,
	"question_id" text NOT NULL,
	"option_title" text NOT NULL,
	"description" text,
	"next_question_id" text,
	"tag" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "booking_flow_option_service" (
	"option_id" text NOT NULL,
	"service_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_flow_question" (
	"id" text PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "booking_flow_option" ADD CONSTRAINT "booking_flow_option_question_id_booking_flow_question_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."booking_flow_question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flow_option" ADD CONSTRAINT "booking_flow_option_next_question_id_booking_flow_question_id_fk" FOREIGN KEY ("next_question_id") REFERENCES "public"."booking_flow_question"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flow_option_service" ADD CONSTRAINT "booking_flow_option_service_option_id_booking_flow_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."booking_flow_option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking_flow_option_service" ADD CONSTRAINT "booking_flow_option_service_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;