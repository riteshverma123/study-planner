CREATE TABLE `ad_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`adType` varchar(50) NOT NULL,
	`questionsUnlocked` int NOT NULL DEFAULT 1,
	`questionsUsed` int NOT NULL DEFAULT 0,
	`watchedAt` datetime NOT NULL,
	`expiresAt` datetime NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ai_call_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` date NOT NULL,
	`callsUsed` int NOT NULL DEFAULT 0,
	`adRewardCallsUnlocked` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ai_call_tracking_id` PRIMARY KEY(`id`)
);
