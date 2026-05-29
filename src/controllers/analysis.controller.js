const {
  getFullAnalysis,
  getSkills,
  getRepositories,
  getReadiness,
  getInsights,
  getRoadmaps,
  getActivity,
  getChatHistory,
} = require("../models/analysis.model");
const { cacheGet, cacheSet } = require("../config/redis");
const { ROLES } = require("../services/roadmap.service");

async function getFullProfileAnalysis(req, res) {
  const username = req.params.username.toLowerCase();
  try {
    const cacheKey = `analysis:full:${username}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const data = await getFullAnalysis(username);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: `No analysis for '${username}'. Run POST /api/profiles/analyze/${username} first.`,
      });
    }

    await cacheSet(cacheKey, data, 300);
    return res.json({ success: true, data });
  } catch (err) {
    console.error("getFullProfileAnalysis:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function getSkillsHandler(req, res) {
  try {
    const skills = await getSkills(req.params.username.toLowerCase());
    if (!skills.length) return res.status(404).json({ success: false, message: "Skills not found." });
    return res.json({ success: true, data: skills });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function getReposHandler(req, res) {
  try {
    const repos = await getRepositories(req.params.username.toLowerCase());
    if (!repos.length) return res.status(404).json({ success: false, message: "Repository analysis not found." });
    return res.json({ success: true, data: repos });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function getReadinessHandler(req, res) {
  try {
    const data = await getReadiness(req.params.username.toLowerCase());
    if (!data) return res.status(404).json({ success: false, message: "Readiness scores not found." });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function getInsightsHandler(req, res) {
  try {
    const data = await getInsights(req.params.username.toLowerCase());
    if (!data) return res.status(404).json({ success: false, message: "Career insights not found." });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function getRoadmapHandler(req, res) {
  try {
    const { role, duration } = req.query;
    const data = await getRoadmaps(req.params.username.toLowerCase(), role, duration);
    if (!data.length) return res.status(404).json({ success: false, message: "Roadmaps not found." });
    return res.json({ success: true, data, supported_roles: ROLES });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function getActivityHandler(req, res) {
  try {
    const data = await getActivity(req.params.username.toLowerCase());
    if (!data) return res.status(404).json({ success: false, message: "Activity analytics not found." });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function getChatHistoryHandler(req, res) {
  try {
    const history = await getChatHistory(req.params.username.toLowerCase());
    return res.json({ success: true, data: history });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

module.exports = {
  getFullProfileAnalysis,
  getSkillsHandler,
  getReposHandler,
  getReadinessHandler,
  getInsightsHandler,
  getRoadmapHandler,
  getActivityHandler,
  getChatHistoryHandler,
};
