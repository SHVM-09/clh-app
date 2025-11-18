CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`domains` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')*1000) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `insights` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text,
	`source` text NOT NULL,
	`raw_text` text NOT NULL,
	`parsed_json` text,
	`strength` text,
	`horizon` text,
	`created_by` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')*1000) NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
