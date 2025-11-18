CREATE TABLE "level_requirements" (
	"level" integer PRIMARY KEY NOT NULL,
	"xp_required" integer NOT NULL,
	"reward_type" varchar(50),
	"reward_value" varchar(100)
);
--> statement-breakpoint
CREATE TABLE "tower_definitions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tower_type" varchar(50) NOT NULL,
	"base_name" varchar(100) NOT NULL,
	"category" varchar(50) NOT NULL,
	"unlock_level" integer NOT NULL,
	"base_cost" integer NOT NULL,
	"base_damage" real NOT NULL,
	"base_range" real NOT NULL,
	"base_fire_rate" real NOT NULL,
	"description" text,
	"lore" text,
	"icon" varchar(10),
	"rarity" varchar(20) DEFAULT 'common' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tower_definitions_tower_type_unique" UNIQUE("tower_type")
);
--> statement-breakpoint
CREATE TABLE "tower_upgrades" (
	"id" serial PRIMARY KEY NOT NULL,
	"tower_type" varchar(50) NOT NULL,
	"upgrade_level" integer NOT NULL,
	"cost_multiplier" real NOT NULL,
	"damage_multiplier" real NOT NULL,
	"range_multiplier" real NOT NULL,
	"fire_rate_multiplier" real NOT NULL,
	"special_bonus_type" varchar(50),
	"special_bonus_value" real,
	"unlock_player_level" integer NOT NULL,
	"upgrade_cost_currency" varchar(20) DEFAULT 'xp' NOT NULL,
	"upgrade_cost_amount" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tower_upgrades_tower_type_upgrade_level_unique" UNIQUE("tower_type","upgrade_level")
);
--> statement-breakpoint
CREATE TABLE "user_tower_unlocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"tower_type" varchar(50) NOT NULL,
	"unlocked_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_tower_unlocks_user_id_tower_type_unique" UNIQUE("user_id","tower_type")
);
--> statement-breakpoint
CREATE TABLE "user_tower_upgrades" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"tower_type" varchar(50) NOT NULL,
	"current_level" integer DEFAULT 1 NOT NULL,
	"upgraded_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_tower_upgrades_user_id_tower_type_unique" UNIQUE("user_id","tower_type")
);
--> statement-breakpoint
CREATE TABLE "xp_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"source" varchar(50) NOT NULL,
	"description" text,
	"game_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "level" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "xp" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_games_played" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "total_enemies_killed" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "highest_wave_reached" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tower_upgrades" ADD CONSTRAINT "tower_upgrades_tower_type_tower_definitions_tower_type_fk" FOREIGN KEY ("tower_type") REFERENCES "public"."tower_definitions"("tower_type") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tower_unlocks" ADD CONSTRAINT "user_tower_unlocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tower_unlocks" ADD CONSTRAINT "user_tower_unlocks_tower_type_tower_definitions_tower_type_fk" FOREIGN KEY ("tower_type") REFERENCES "public"."tower_definitions"("tower_type") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tower_upgrades" ADD CONSTRAINT "user_tower_upgrades_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_tower_upgrades" ADD CONSTRAINT "user_tower_upgrades_tower_type_tower_definitions_tower_type_fk" FOREIGN KEY ("tower_type") REFERENCES "public"."tower_definitions"("tower_type") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_transactions" ADD CONSTRAINT "xp_transactions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE set null ON UPDATE no action;