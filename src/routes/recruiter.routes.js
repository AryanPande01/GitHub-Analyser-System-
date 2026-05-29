const express = require("express");
const { param, query } = require("express-validator");
const validate = require("../middleware/validate");
const { listCandidates, getCandidate } = require("../controllers/recruiter.controller");

const router = express.Router();

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    query("sortBy").optional().isIn(["overall_score", "frontend_score", "backend_score", "productivity_score"]),
  ],
  validate,
  listCandidates
);

router.get(
  "/:username",
  [
    param("username")
      .trim()
      .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/),
  ],
  validate,
  getCandidate
);

module.exports = router;
