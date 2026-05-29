const express = require("express");
const { param } = require("express-validator");
const validate = require("../middleware/validate");
const {
  getFullProfileAnalysis,
  getSkillsHandler,
  getReposHandler,
  getReadinessHandler,
  getInsightsHandler,
  getRoadmapHandler,
  getActivityHandler,
  getChatHistoryHandler,
} = require("../controllers/analysis.controller");

const router = express.Router();

const usernameParam = param("username")
  .trim()
  .notEmpty()
  .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/)
  .withMessage("Invalid GitHub username format");

router.get("/:username/full", [usernameParam], validate, getFullProfileAnalysis);
router.get("/:username/skills", [usernameParam], validate, getSkillsHandler);
router.get("/:username/repositories", [usernameParam], validate, getReposHandler);
router.get("/:username/readiness", [usernameParam], validate, getReadinessHandler);
router.get("/:username/insights", [usernameParam], validate, getInsightsHandler);
router.get("/:username/roadmap", [usernameParam], validate, getRoadmapHandler);
router.get("/:username/activity", [usernameParam], validate, getActivityHandler);
router.get("/:username/chat", [usernameParam], validate, getChatHistoryHandler);

module.exports = router;
