CREATE TABLE `applications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobId` int NOT NULL,
	`resumeId` int,
	`tailoredResumeId` int,
	`status` enum('draft','submitted','viewed','shortlisted','interview_scheduled','rejected','offer_received','accepted','withdrawn') DEFAULT 'submitted',
	`appliedDate` timestamp NOT NULL DEFAULT (now()),
	`lastStatusUpdate` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`notes` text,
	`interviewDate` datetime,
	`interviewType` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `applications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId1` int NOT NULL,
	`userId2` int NOT NULL,
	`status` enum('pending','accepted','blocked') DEFAULT 'pending',
	`initiatedBy` int NOT NULL,
	`message` text,
	`connectedAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `courses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` longtext,
	`category` varchar(100),
	`level` enum('beginner','intermediate','advanced') DEFAULT 'beginner',
	`duration` int,
	`instructor` varchar(255),
	`imageUrl` text,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `courses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `externalProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` enum('github','linkedin','portfolio','personal_website') NOT NULL,
	`profileUrl` varchar(500) NOT NULL,
	`username` varchar(255),
	`verified` boolean DEFAULT false,
	`lastSyncedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `externalProfiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobMatches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobId` int NOT NULL,
	`matchScore` decimal(5,2) NOT NULL,
	`matchReason` text,
	`skillsMatched` json,
	`skillsGap` json,
	`recommendedAt` timestamp NOT NULL DEFAULT (now()),
	`dismissed` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `jobMatches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `jobSeekerProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`headline` varchar(255),
	`currentRole` varchar(255),
	`yearsExperience` int,
	`desiredRoles` json,
	`desiredLocations` json,
	`salaryExpectation` decimal(10,2),
	`workPreference` enum('remote','hybrid','onsite'),
	`availability` varchar(50),
	`openToOpportunities` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobSeekerProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `jobSeeker_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`company` varchar(255) NOT NULL,
	`location` varchar(255),
	`description` longtext NOT NULL,
	`requirements` longtext,
	`salary` varchar(100),
	`jobType` enum('full_time','part_time','contract','freelance'),
	`source` enum('linkedin','indeed','upwork','other') NOT NULL,
	`sourceJobId` varchar(255) NOT NULL,
	`sourceUrl` varchar(500),
	`postedDate` datetime,
	`expiryDate` datetime,
	`companyLogoUrl` text,
	`isActive` boolean DEFAULT true,
	`scrapedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `jobs_id` PRIMARY KEY(`id`),
	CONSTRAINT `job_sourceJobId_idx` UNIQUE(`sourceJobId`,`source`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`recipientId` int NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean DEFAULT false,
	`readAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mockInterviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`jobId` int,
	`interviewType` enum('behavioral','technical','case_study','general') NOT NULL,
	`difficulty` enum('easy','medium','hard') DEFAULT 'medium',
	`status` enum('scheduled','in_progress','completed','cancelled') DEFAULT 'scheduled',
	`startedAt` datetime,
	`completedAt` datetime,
	`duration` int,
	`score` decimal(5,2),
	`feedback` longtext,
	`transcript` longtext,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mockInterviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `postedJobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recruiterId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` longtext NOT NULL,
	`requirements` longtext,
	`salary` varchar(100),
	`jobType` enum('full_time','part_time','contract'),
	`location` varchar(255),
	`status` enum('draft','published','closed','filled') DEFAULT 'draft',
	`applicantCount` int DEFAULT 0,
	`publishedAt` datetime,
	`closedAt` datetime,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `postedJobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recruiterProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`companyName` varchar(255) NOT NULL,
	`companyWebsite` varchar(255),
	`industry` varchar(255),
	`companySize` varchar(50),
	`jobTitle` varchar(255),
	`department` varchar(255),
	`companyLogoUrl` text,
	`verificationStatus` enum('pending','verified','rejected') DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recruiterProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `recruiter_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `resumes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` longtext NOT NULL,
	`isDefault` boolean DEFAULT false,
	`version` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `resumes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `savedSearches` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`filters` json NOT NULL,
	`alertEnabled` boolean DEFAULT true,
	`alertFrequency` enum('daily','weekly','immediate') DEFAULT 'daily',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `savedSearches_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `skills` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`skillName` varchar(255) NOT NULL,
	`proficiencyLevel` enum('beginner','intermediate','advanced','expert'),
	`yearsOfExperience` int,
	`endorsements` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `skills_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tailoredResumes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`baseResumeId` int NOT NULL,
	`jobId` int NOT NULL,
	`tailoredContent` longtext NOT NULL,
	`matchScore` decimal(5,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tailoredResumes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userCourseProgress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`courseId` int NOT NULL,
	`status` enum('enrolled','in_progress','completed') DEFAULT 'enrolled',
	`progress` int DEFAULT 0,
	`completedAt` datetime,
	`certificateUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userCourseProgress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('job_seeker','recruiter') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `profileCompleted` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `profilePictureUrl` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
CREATE INDEX `application_userId_idx` ON `applications` (`userId`);--> statement-breakpoint
CREATE INDEX `application_jobId_idx` ON `applications` (`jobId`);--> statement-breakpoint
CREATE INDEX `application_status_idx` ON `applications` (`status`);--> statement-breakpoint
CREATE INDEX `connection_userId1_idx` ON `connections` (`userId1`);--> statement-breakpoint
CREATE INDEX `connection_userId2_idx` ON `connections` (`userId2`);--> statement-breakpoint
CREATE INDEX `externalProfile_userId_idx` ON `externalProfiles` (`userId`);--> statement-breakpoint
CREATE INDEX `externalProfile_platform_idx` ON `externalProfiles` (`platform`);--> statement-breakpoint
CREATE INDEX `jobMatch_userId_idx` ON `jobMatches` (`userId`);--> statement-breakpoint
CREATE INDEX `jobMatch_jobId_idx` ON `jobMatches` (`jobId`);--> statement-breakpoint
CREATE INDEX `jobMatch_matchScore_idx` ON `jobMatches` (`matchScore`);--> statement-breakpoint
CREATE INDEX `jobSeeker_userId_idx` ON `jobSeekerProfiles` (`userId`);--> statement-breakpoint
CREATE INDEX `job_company_idx` ON `jobs` (`company`);--> statement-breakpoint
CREATE INDEX `job_isActive_idx` ON `jobs` (`isActive`);--> statement-breakpoint
CREATE INDEX `message_senderId_idx` ON `messages` (`senderId`);--> statement-breakpoint
CREATE INDEX `message_recipientId_idx` ON `messages` (`recipientId`);--> statement-breakpoint
CREATE INDEX `mockInterview_userId_idx` ON `mockInterviews` (`userId`);--> statement-breakpoint
CREATE INDEX `mockInterview_status_idx` ON `mockInterviews` (`status`);--> statement-breakpoint
CREATE INDEX `postedJob_recruiterId_idx` ON `postedJobs` (`recruiterId`);--> statement-breakpoint
CREATE INDEX `postedJob_status_idx` ON `postedJobs` (`status`);--> statement-breakpoint
CREATE INDEX `recruiter_userId_idx` ON `recruiterProfiles` (`userId`);--> statement-breakpoint
CREATE INDEX `resume_userId_idx` ON `resumes` (`userId`);--> statement-breakpoint
CREATE INDEX `savedSearch_userId_idx` ON `savedSearches` (`userId`);--> statement-breakpoint
CREATE INDEX `skill_userId_idx` ON `skills` (`userId`);--> statement-breakpoint
CREATE INDEX `tailoredResume_userId_idx` ON `tailoredResumes` (`userId`);--> statement-breakpoint
CREATE INDEX `tailoredResume_jobId_idx` ON `tailoredResumes` (`jobId`);--> statement-breakpoint
CREATE INDEX `userCourseProgress_userId_idx` ON `userCourseProgress` (`userId`);--> statement-breakpoint
CREATE INDEX `userCourseProgress_courseId_idx` ON `userCourseProgress` (`courseId`);--> statement-breakpoint
CREATE INDEX `email_idx` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `userType_idx` ON `users` (`userType`);