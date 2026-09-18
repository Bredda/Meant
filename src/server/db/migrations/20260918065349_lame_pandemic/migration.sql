CREATE TABLE `messages` (
	`content` text NOT NULL,
	`created_at` integer NOT NULL,
	`id` text PRIMARY KEY,
	`position` integer NOT NULL,
	`role` text NOT NULL,
	`thread_id` text NOT NULL,
	`tool_call_id` text,
	`tool_name` text,
	CONSTRAINT `fk_messages_thread_id_threads_id_fk` FOREIGN KEY (`thread_id`) REFERENCES `threads`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `threads` (
	`created_at` integer NOT NULL,
	`id` text PRIMARY KEY,
	`title` text NOT NULL,
	`updated_at` integer NOT NULL
);
