const { compareDevelopers } = require("../services/compare.service");

async function compare(req, res) {
  const { usernames } = req.body;

  try {
    const report = await compareDevelopers(usernames.map((u) => u.toLowerCase()));
    return res.json({ success: true, data: report });
  } catch (err) {
    if (err.code === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: err.message,
        missing: err.missing,
      });
    }
    console.error("compare error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

module.exports = { compare };
