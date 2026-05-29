const { pool } = require("../config/db");

async function createAnalysisTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS skill_analysis (
      id INT AUTO_INCREMENT PRIMARY KEY,
      profile_id INT NOT NULL,
      username VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      skills JSON NOT NULL,
      score DECIMAL(5,2) NOT NULL DEFAULT 0,
      detected_count INT NOT NULL DEFAULT 0,
      analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_profile_category (profile_id, category),
      INDEX idx_skill_username (username),
      CONSTRAINT fk_skill_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS repository_analysis (
      id INT AUTO_INCREMENT PRIMARY KEY,
      profile_id INT NOT NULL,
      username VARCHAR(100) NOT NULL,
      repo_name VARCHAR(255) NOT NULL,
      repo_url VARCHAR(512),
      language VARCHAR(100),
      domain VARCHAR(100) NOT NULL,
      complexity_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      activity_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      popularity_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      open_source_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      quality_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      stars INT DEFAULT 0,
      forks INT DEFAULT 0,
      is_fork BOOLEAN DEFAULT FALSE,
      metadata JSON,
      analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_profile_repo (profile_id, repo_name),
      INDEX idx_repo_username (username),
      CONSTRAINT fk_repo_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS readiness_scores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      profile_id INT NOT NULL,
      username VARCHAR(100) NOT NULL,
      frontend_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      backend_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      database_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      devops_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      system_design_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      problem_solving_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      explanations JSON NOT NULL,
      overall_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_readiness_profile (profile_id),
      INDEX idx_readiness_username (username),
      CONSTRAINT fk_readiness_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS career_insights (
      id INT AUTO_INCREMENT PRIMARY KEY,
      profile_id INT NOT NULL,
      username VARCHAR(100) NOT NULL,
      strengths JSON NOT NULL,
      weaknesses JSON NOT NULL,
      missing_skills JSON NOT NULL,
      career_paths JSON NOT NULL,
      resume_suggestions JSON NOT NULL,
      portfolio_suggestions JSON NOT NULL,
      interview_suggestions JSON NOT NULL,
      raw_response JSON,
      generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_insights_profile (profile_id),
      INDEX idx_insights_username (username),
      CONSTRAINT fk_insights_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS roadmaps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      profile_id INT NOT NULL,
      username VARCHAR(100) NOT NULL,
      target_role VARCHAR(100) NOT NULL,
      duration ENUM('1_month','3_month','6_month') NOT NULL,
      phases JSON NOT NULL,
      focus_areas JSON NOT NULL,
      generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_roadmap (profile_id, target_role, duration),
      INDEX idx_roadmap_username (username),
      CONSTRAINT fk_roadmap_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS activity_analytics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      profile_id INT NOT NULL,
      username VARCHAR(100) NOT NULL,
      contribution_consistency DECIMAL(5,2) NOT NULL DEFAULT 0,
      commit_frequency_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      activity_trend VARCHAR(50) NOT NULL DEFAULT 'stable',
      repository_growth_trend VARCHAR(50) NOT NULL DEFAULT 'stable',
      productivity_score DECIMAL(5,2) NOT NULL DEFAULT 0,
      metrics JSON,
      analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_activity_profile (profile_id),
      INDEX idx_activity_username (username),
      CONSTRAINT fk_activity_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

    `CREATE TABLE IF NOT EXISTS chat_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      profile_id INT NOT NULL,
      username VARCHAR(100) NOT NULL,
      role ENUM('user','assistant') NOT NULL,
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_chat_profile (profile_id),
      INDEX idx_chat_username (username),
      CONSTRAINT fk_chat_profile FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
  ];

  for (const sql of tables) {
    await pool.execute(sql);
  }
  console.log("✅ Analysis tables ready");
}

async function getProfileId(username) {
  const [rows] = await pool.execute("SELECT id FROM profiles WHERE username = ?", [username]);
  return rows[0]?.id || null;
}

async function upsertSkillAnalysis(profileId, username, categories) {
  for (const [category, data] of Object.entries(categories)) {
    await pool.execute(
      `INSERT INTO skill_analysis (profile_id, username, category, skills, score, detected_count)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE skills = VALUES(skills), score = VALUES(score),
         detected_count = VALUES(detected_count), analyzed_at = CURRENT_TIMESTAMP`,
      [profileId, username, category, JSON.stringify(data.skills), data.score, data.detected_count]
    );
  }
}

async function upsertRepositoryAnalysis(profileId, username, repos) {
  await pool.execute("DELETE FROM repository_analysis WHERE profile_id = ?", [profileId]);
  for (const repo of repos) {
    await pool.execute(
      `INSERT INTO repository_analysis (
        profile_id, username, repo_name, repo_url, language, domain,
        complexity_score, activity_score, popularity_score, open_source_score, quality_score,
        stars, forks, is_fork, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        profileId, username, repo.repo_name, repo.repo_url, repo.language, repo.domain,
        repo.complexity_score, repo.activity_score, repo.popularity_score,
        repo.open_source_score, repo.quality_score, repo.stars, repo.forks, repo.is_fork,
        JSON.stringify(repo.metadata),
      ]
    );
  }
}

async function upsertReadinessScores(profileId, username, data) {
  await pool.execute(
    `INSERT INTO readiness_scores (
      profile_id, username, frontend_score, backend_score, database_score,
      devops_score, system_design_score, problem_solving_score, explanations, overall_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      frontend_score = VALUES(frontend_score), backend_score = VALUES(backend_score),
      database_score = VALUES(database_score), devops_score = VALUES(devops_score),
      system_design_score = VALUES(system_design_score),
      problem_solving_score = VALUES(problem_solving_score),
      explanations = VALUES(explanations), overall_score = VALUES(overall_score),
      updated_at = CURRENT_TIMESTAMP`,
    [
      profileId, username, data.frontend_score, data.backend_score, data.database_score,
      data.devops_score, data.system_design_score, data.problem_solving_score,
      JSON.stringify(data.explanations), data.overall_score,
    ]
  );
}

async function upsertCareerInsights(profileId, username, insights) {
  await pool.execute(
    `INSERT INTO career_insights (
      profile_id, username, strengths, weaknesses, missing_skills, career_paths,
      resume_suggestions, portfolio_suggestions, interview_suggestions, raw_response
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      strengths = VALUES(strengths), weaknesses = VALUES(weaknesses),
      missing_skills = VALUES(missing_skills), career_paths = VALUES(career_paths),
      resume_suggestions = VALUES(resume_suggestions),
      portfolio_suggestions = VALUES(portfolio_suggestions),
      interview_suggestions = VALUES(interview_suggestions),
      raw_response = VALUES(raw_response), generated_at = CURRENT_TIMESTAMP`,
    [
      profileId, username,
      JSON.stringify(insights.strengths), JSON.stringify(insights.weaknesses),
      JSON.stringify(insights.missing_skills), JSON.stringify(insights.career_paths),
      JSON.stringify(insights.resume_suggestions), JSON.stringify(insights.portfolio_suggestions),
      JSON.stringify(insights.interview_suggestions),
      insights.raw_response ? JSON.stringify(insights.raw_response) : null,
    ]
  );
}

async function upsertRoadmap(profileId, username, targetRole, duration, roadmap) {
  await pool.execute(
    `INSERT INTO roadmaps (profile_id, username, target_role, duration, phases, focus_areas)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE phases = VALUES(phases), focus_areas = VALUES(focus_areas),
       generated_at = CURRENT_TIMESTAMP`,
    [profileId, username, targetRole, duration, JSON.stringify(roadmap.phases), JSON.stringify(roadmap.focus_areas)]
  );
}

async function upsertActivityAnalytics(profileId, username, activity) {
  await pool.execute(
    `INSERT INTO activity_analytics (
      profile_id, username, contribution_consistency, commit_frequency_score,
      activity_trend, repository_growth_trend, productivity_score, metrics
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      contribution_consistency = VALUES(contribution_consistency),
      commit_frequency_score = VALUES(commit_frequency_score),
      activity_trend = VALUES(activity_trend),
      repository_growth_trend = VALUES(repository_growth_trend),
      productivity_score = VALUES(productivity_score),
      metrics = VALUES(metrics), analyzed_at = CURRENT_TIMESTAMP`,
    [
      profileId, username, activity.contribution_consistency, activity.commit_frequency_score,
      activity.activity_trend, activity.repository_growth_trend, activity.productivity_score,
      JSON.stringify(activity.metrics),
    ]
  );
}

async function saveChatMessage(profileId, username, role, message) {
  await pool.execute(
    "INSERT INTO chat_history (profile_id, username, role, message) VALUES (?, ?, ?, ?)",
    [profileId, username, role, message]
  );
}

async function getSkills(username) {
  const [rows] = await pool.execute(
    "SELECT category, skills, score, detected_count, analyzed_at FROM skill_analysis WHERE username = ?",
    [username]
  );
  return rows.map((r) => ({ ...r, skills: parseJson(r.skills) }));
}

async function getRepositories(username) {
  const [rows] = await pool.execute(
    "SELECT * FROM repository_analysis WHERE username = ? ORDER BY quality_score DESC",
    [username]
  );
  return rows.map((r) => ({ ...r, metadata: parseJson(r.metadata), is_fork: !!r.is_fork }));
}

async function getReadiness(username) {
  const [rows] = await pool.execute("SELECT * FROM readiness_scores WHERE username = ?", [username]);
  if (!rows[0]) return null;
  return { ...rows[0], explanations: parseJson(rows[0].explanations) };
}

async function getInsights(username) {
  const [rows] = await pool.execute("SELECT * FROM career_insights WHERE username = ?", [username]);
  if (!rows[0]) return null;
  const r = rows[0];
  return {
    ...r,
    strengths: parseJson(r.strengths),
    weaknesses: parseJson(r.weaknesses),
    missing_skills: parseJson(r.missing_skills),
    career_paths: parseJson(r.career_paths),
    resume_suggestions: parseJson(r.resume_suggestions),
    portfolio_suggestions: parseJson(r.portfolio_suggestions),
    interview_suggestions: parseJson(r.interview_suggestions),
  };
}

async function getRoadmaps(username, targetRole, duration) {
  let sql = "SELECT * FROM roadmaps WHERE username = ?";
  const params = [username];
  if (targetRole) { sql += " AND target_role = ?"; params.push(targetRole); }
  if (duration) { sql += " AND duration = ?"; params.push(duration); }
  const [rows] = await pool.execute(sql, params);
  return rows.map((r) => ({
    ...r,
    phases: parseJson(r.phases),
    focus_areas: parseJson(r.focus_areas),
  }));
}

async function getActivity(username) {
  const [rows] = await pool.execute("SELECT * FROM activity_analytics WHERE username = ?", [username]);
  if (!rows[0]) return null;
  return { ...rows[0], metrics: parseJson(rows[0].metrics) };
}

async function getChatHistory(username, limit = 20) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
  const [rows] = await pool.query(
    "SELECT role, message, created_at FROM chat_history WHERE username = ? ORDER BY created_at DESC LIMIT ?",
    [username, safeLimit]
  );
  return rows.reverse();
}

async function getFullAnalysis(username) {
  const [profile] = await pool.execute("SELECT * FROM profiles WHERE username = ?", [username]);
  if (!profile[0]) return null;

  const [skills, repos, readiness, insights, roadmaps, activity] = await Promise.all([
    getSkills(username),
    getRepositories(username),
    getReadiness(username),
    getInsights(username),
    getRoadmaps(username),
    getActivity(username),
  ]);

  return {
    profile: profile[0],
    skills,
    repositories: repos,
    readiness,
    insights,
    roadmaps,
    activity,
  };
}

function parseJson(val) {
  if (!val) return val;
  if (typeof val === "object") return val;
  try { return JSON.parse(val); } catch { return val; }
}

module.exports = {
  createAnalysisTables,
  getProfileId,
  upsertSkillAnalysis,
  upsertRepositoryAnalysis,
  upsertReadinessScores,
  upsertCareerInsights,
  upsertRoadmap,
  upsertActivityAnalytics,
  saveChatMessage,
  getSkills,
  getRepositories,
  getReadiness,
  getInsights,
  getRoadmaps,
  getActivity,
  getChatHistory,
  getFullAnalysis,
};
