const express = require("express");
const { param } = require("express-validator");
const validate = require("../middleware/validate");
const { getResume } = require("../controllers/resume.controller");

const router = express.Router();

router.get(
  "/:username",
  [
    param("username")
      .trim()
      .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/),
  ],
  validate,
  getResume
);

module.exports = router;
