const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { chat } = require("../controllers/chat.controller");

const router = express.Router();

router.post(
  "/",
  [
    body("username")
      .trim()
      .notEmpty()
      .matches(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/),
    body("message").trim().notEmpty().isLength({ min: 1, max: 2000 }),
  ],
  validate,
  chat
);

module.exports = router;
