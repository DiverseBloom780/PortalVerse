CREATE TABLE `portal_states` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` enum('lego_dimensions','skylanders','disney_infinity') NOT NULL,
	`isActive` int NOT NULL DEFAULT 0,
	`ledColor` varchar(7) DEFAULT '#0000FF',
	`figuresOnPortal` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `portal_states_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `toy_placements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`portalStateId` int NOT NULL,
	`toyId` int NOT NULL,
	`placedAt` timestamp NOT NULL DEFAULT (now()),
	`removedAt` timestamp,
	CONSTRAINT `toy_placements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `toy_upgrades` (
	`id` int AUTO_INCREMENT NOT NULL,
	`toyId` int NOT NULL,
	`upgradeKey` varchar(255) NOT NULL,
	`upgradeValue` text,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `toy_upgrades_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `virtual_toys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` enum('lego_dimensions','skylanders','disney_infinity') NOT NULL,
	`toyId` varchar(64) NOT NULL,
	`toyName` varchar(255) NOT NULL,
	`toyType` enum('character','vehicle','item','magic_item','power_disc') NOT NULL,
	`nfcData` text,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `virtual_toys_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `portal_states` ADD CONSTRAINT `portal_states_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `toy_placements` ADD CONSTRAINT `toy_placements_portalStateId_portal_states_id_fk` FOREIGN KEY (`portalStateId`) REFERENCES `portal_states`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `toy_placements` ADD CONSTRAINT `toy_placements_toyId_virtual_toys_id_fk` FOREIGN KEY (`toyId`) REFERENCES `virtual_toys`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `toy_upgrades` ADD CONSTRAINT `toy_upgrades_toyId_virtual_toys_id_fk` FOREIGN KEY (`toyId`) REFERENCES `virtual_toys`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `virtual_toys` ADD CONSTRAINT `virtual_toys_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;