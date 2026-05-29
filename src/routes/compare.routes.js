const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { compare } = require("../controllers/compare.controller");

const router = express.Router();

router.post(
  "/",
  [
    body("usernames")
      .isArray({ min: 2, max: 5 })
      .withMessage("usernames must be an array of 2-5 GitHub usernames"),
    body("usernames.*")
      .trim()
      .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/)
      .withMessage("Invalid username in array"),
  ],
  validate,
  compare
);

module.exports = router;
