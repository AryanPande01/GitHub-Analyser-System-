const { detectSkillsFromRepos } = require("../utils/skillDetector");
const { analyzeAllRepositories } = require("../utils/repositoryEngine");
const { computeReadinessScores } = require("../utils/readinessEngine");
const { computeActivityAnalytics } = require("../utils/activityEngine");
const { generateCareerInsights, generateRoadmaps } = require("./ai.service");
const { ROLES } = require("./roadmap.service");
const {
  getProfileId,
  upsertSkillAnalysis,
  upsertRepositoryAnalysis,
  upsertReadinessScores,
  upsertCareerInsights,
  upsertRoadmap,
  upsertActivityAnalytics,
} = require("../models/analysis.model");
const { cacheDel } = require("../config/redis");

async function runFullAnalysis(username, profile, repos) {
  const profileId = await getProfileId(username);
  if (!profileId) throw new Error("Profile must be stored before running analysis");

  const skillCategories = detectSkillsFromRepos(repos);
  const skillRows = Object.entries(skillCategories).map(([category, data]) => ({
    category,
    skills: data.skills,
    score: data.score,
    detected_count: data.detected_count,
  }));

  await upsertSkillAnalysis(profileId, username, skillCategories);

  const repoAnalysis = analyzeAllRepositories(repos);
  await upsertRepositoryAnalysis(profileId, username, repoAnalysis);

  const activity = computeActivityAnalytics(repos, profile);
  await upsertActivityAnalytics(profileId, username, activity);

  const readiness = computeReadinessScores(skillRows, repoAnalysis, profile, activity);
  readiness.explanations = {
    ...readiness.explanations,
    influence_score: readiness.influence_score,
    influence_tier: readiness.influence_tier,
  };
  await upsertReadinessScores(profileId, username, readiness);

  const skillsForAi = skillRows;
  const insights = await generateCareerInsights({
    profile,
    skills: skillsForAi,
    readiness,
    repositories: repoAnalysis,
    activity,
  });
  await upsertCareerInsights(profileId, username, insights);

  const targetRole = insights.career_paths?.[0] || "Full Stack Developer";
  const safeRole = ROLES.includes(targetRole) ? targetRole : "Full Stack Developer";
  const roadmaps = await generateRoadmaps(
    {
      profile,
      skills: skillRows,
      readiness,
      repositories: repoAnalysis,
      activity,
      insights,
    },
    safeRole
  );

  for (const rm of roadmaps) {
    await upsertRoadmap(profileId, username, safeRole, rm.duration, rm);
  }

  await cacheDel(`analysis:${username}*`);

  return {
    skills: skillRows,
    repositories: repoAnalysis,
    activity,
    readiness,
    insights,
    roadmaps: roadmaps.map((r) => ({
      target_role: safeRole,
      duration: r.duration,
      focus_areas: r.focus_areas,
      phases: r.phases,
    })),
  };
}

module.exports = { runFullAnalysis };
