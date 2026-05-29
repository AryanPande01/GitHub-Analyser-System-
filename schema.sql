CREATE TABLE `profiles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `github_url` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `bio` text,
  `location` varchar(255) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `twitter_username` varchar(100) DEFAULT NULL,
  `hireable` tinyint(1) DEFAULT '0',
  `public_repos` int DEFAULT '0',
  `public_gists` int DEFAULT '0',
  `followers` int DEFAULT '0',
  `following` int DEFAULT '0',
  `total_stars` int DEFAULT '0',
  `total_forks` int DEFAULT '0',
  `total_watchers` int DEFAULT '0',
  `avg_stars_per_repo` decimal(10,2) DEFAULT '0.00',
  `most_starred_repo` varchar(255) DEFAULT NULL,
  `most_starred_repo_stars` int DEFAULT '0',
  `recently_active_repos` int DEFAULT '0',
  `original_repos` int DEFAULT '0',
  `forked_repos` int DEFAULT '0',
  `top_languages` json DEFAULT NULL,
  `has_website` tinyint(1) DEFAULT '0',
  `account_age_days` int DEFAULT '0',
  `analyzed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  KEY `idx_username` (`username`),
  KEY `idx_total_stars` (`total_stars`),
  KEY `idx_followers` (`followers`)
);

CREATE TABLE `skill_analysis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profile_id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `skills` json NOT NULL,
  `score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `detected_count` int NOT NULL DEFAULT '0',
  `analyzed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_profile_category` (`profile_id`, `category`),
  KEY `idx_skill_username` (`username`),
  CONSTRAINT `fk_skill_profile` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
);

CREATE TABLE `repository_analysis` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profile_id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `repo_name` varchar(255) NOT NULL,
  `repo_url` varchar(512) DEFAULT NULL,
  `language` varchar(100) DEFAULT NULL,
  `domain` varchar(100) NOT NULL,
  `complexity_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `activity_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `popularity_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `open_source_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `quality_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `stars` int DEFAULT '0',
  `forks` int DEFAULT '0',
  `is_fork` tinyint(1) DEFAULT '0',
  `metadata` json DEFAULT NULL,
  `analyzed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_profile_repo` (`profile_id`, `repo_name`),
  KEY `idx_repo_username` (`username`),
  CONSTRAINT `fk_repo_profile` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
);

CREATE TABLE `readiness_scores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profile_id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `frontend_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `backend_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `database_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `devops_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `system_design_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `problem_solving_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `explanations` json NOT NULL,
  `overall_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `analyzed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_readiness_profile` (`profile_id`),
  KEY `idx_readiness_username` (`username`),
  CONSTRAINT `fk_readiness_profile` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
);

CREATE TABLE `career_insights` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profile_id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `strengths` json NOT NULL,
  `weaknesses` json NOT NULL,
  `missing_skills` json NOT NULL,
  `career_paths` json NOT NULL,
  `resume_suggestions` json NOT NULL,
  `portfolio_suggestions` json NOT NULL,
  `interview_suggestions` json NOT NULL,
  `raw_response` json DEFAULT NULL,
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_insights_profile` (`profile_id`),
  KEY `idx_insights_username` (`username`),
  CONSTRAINT `fk_insights_profile` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
);

CREATE TABLE `roadmaps` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profile_id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `target_role` varchar(100) NOT NULL,
  `duration` enum('1_month','3_month','6_month') NOT NULL,
  `phases` json NOT NULL,
  `focus_areas` json NOT NULL,
  `generated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roadmap` (`profile_id`, `target_role`, `duration`),
  KEY `idx_roadmap_username` (`username`),
  CONSTRAINT `fk_roadmap_profile` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
);

CREATE TABLE `activity_analytics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profile_id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `contribution_consistency` decimal(5,2) NOT NULL DEFAULT '0.00',
  `commit_frequency_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `activity_trend` varchar(50) NOT NULL DEFAULT 'stable',
  `repository_growth_trend` varchar(50) NOT NULL DEFAULT 'stable',
  `productivity_score` decimal(5,2) NOT NULL DEFAULT '0.00',
  `metrics` json DEFAULT NULL,
  `analyzed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_activity_profile` (`profile_id`),
  KEY `idx_activity_username` (`username`),
  CONSTRAINT `fk_activity_profile` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
);

CREATE TABLE `chat_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `profile_id` int NOT NULL,
  `username` varchar(100) NOT NULL,
  `role` enum('user','assistant') NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_chat_profile` (`profile_id`),
  KEY `idx_chat_username` (`username`),
  CONSTRAINT `fk_chat_profile` FOREIGN KEY (`profile_id`) REFERENCES `profiles` (`id`) ON DELETE CASCADE
);
