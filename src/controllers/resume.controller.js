const { generateResumeData } = require("../services/resume.service");
const { cacheGet, cacheSet } = require("../config/redis");

async function getResume(req, res) {
  const username = req.params.username.toLowerCase();

  try {
    const cacheKey = `resume:${username}`;
    const cached = await cacheGet(cacheKey);
    if (cached) return res.json({ success: true, data: cached, cached: true });

    const data = await generateResumeData(username);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: `Resume data unavailable for '${username}'. Analyze profile first.`,
      });
    }

    await cacheSet(cacheKey, data, 600);
    return res.json({ success: true, data });
  } catch (err) {
    console.error("getResume error:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

module.exports = { getResume };
