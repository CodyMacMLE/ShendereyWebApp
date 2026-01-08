CREATE TYPE "public"."category" AS ENUM('competitive', 'recreational');--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"athlete" integer,
	"title" text,
	"description" text,
	"date" timestamp
);
--> statement-breakpoint
CREATE TABLE "alumni" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" integer,
	"school" text,
	"year" timestamp,
	"description" text,
	"alumniImgUrl" text
);
--> statement-breakpoint
CREATE TABLE "athletes" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" integer,
	"level" text,
	"athleteImgUrl" text
);
--> statement-breakpoint
CREATE TABLE "coach_group_lines" (
	"id" serial PRIMARY KEY NOT NULL,
	"coachId" integer,
	"groupId" integer
);
--> statement-breakpoint
CREATE TABLE "coaches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" integer,
	"title" text,
	"description" text,
	"isSeniorStaff" boolean DEFAULT false,
	"coachImgUrl" text
);
--> statement-breakpoint
CREATE TABLE "employment" (
	"id" serial PRIMARY KEY NOT NULL,
	"position" text,
	"description" text,
	"requirements" text,
	"contract" text,
	"isFeatured" boolean,
	"dateCreated" timestamp
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" serial PRIMARY KEY NOT NULL,
	"program" integer,
	"coach" text,
	"day" text,
	"startTime" time,
	"endTime" time,
	"startDate" timestamp,
	"endDate" timestamp
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"category" "category",
	"description" text,
	"length" integer,
	"ages" text,
	"programImgUrl" text
);
--> statement-breakpoint
CREATE TABLE "prospects" (
	"id" serial PRIMARY KEY NOT NULL,
	"user" integer,
	"graduationYear" timestamp,
	"description" text,
	"major" text,
	"institution" text,
	"youtubeLink" text,
	"prospectImgUrl" text
);
--> statement-breakpoint
CREATE TABLE "scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"athlete" integer,
	"competition" text,
	"date" timestamp,
	"category" text,
	"bars" double precision,
	"beam" double precision,
	"floor" double precision,
	"vault" double precision,
	"overall" double precision
);
--> statement-breakpoint
CREATE TABLE "sponsors" (
	"id" serial PRIMARY KEY NOT NULL,
	"organization" text,
	"description" text,
	"requirements" text,
	"sponsorLevel" text,
	"sponsorImgUrl" text
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"author" text,
	"authorImgUrl" text,
	"testimonial" text,
	"isFeatured" boolean
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"isActive" boolean DEFAULT false,
	"isAthlete" boolean DEFAULT false,
	"isAlumni" boolean DEFAULT false,
	"isProspect" boolean DEFAULT false,
	"isCoach" boolean DEFAULT false,
	"isScouted" boolean DEFAULT false,
	"createdAt" timestamp,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "videos" (
	"id" serial PRIMARY KEY NOT NULL,
	"athlete" integer,
	"name" text,
	"description" text,
	"date" timestamp,
	"videoUrl" text
);
--> statement-breakpoint
ALTER TABLE "achievements" ADD CONSTRAINT "achievements_athlete_athletes_id_fk" FOREIGN KEY ("athlete") REFERENCES "public"."athletes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alumni" ADD CONSTRAINT "alumni_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "athletes" ADD CONSTRAINT "athletes_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_group_lines" ADD CONSTRAINT "coach_group_lines_coachId_coaches_id_fk" FOREIGN KEY ("coachId") REFERENCES "public"."coaches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coach_group_lines" ADD CONSTRAINT "coach_group_lines_groupId_groups_id_fk" FOREIGN KEY ("groupId") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coaches" ADD CONSTRAINT "coaches_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_program_programs_id_fk" FOREIGN KEY ("program") REFERENCES "public"."programs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prospects" ADD CONSTRAINT "prospects_user_users_id_fk" FOREIGN KEY ("user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scores" ADD CONSTRAINT "scores_athlete_athletes_id_fk" FOREIGN KEY ("athlete") REFERENCES "public"."athletes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "videos" ADD CONSTRAINT "videos_athlete_athletes_id_fk" FOREIGN KEY ("athlete") REFERENCES "public"."athletes"("id") ON DELETE no action ON UPDATE no action;