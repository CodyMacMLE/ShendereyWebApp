CREATE TABLE "gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"description" text,
	"date" timestamp,
	"galleryUrl" text
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"date" timestamp,
	"resourceUrl" text
);
