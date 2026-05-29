const { getCandidateRankings, getCandidateDetail } = require("../services/recruiter.service");

async function listCandidates(req, res) {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const sortBy = req.query.sortBy || "overall_score";

  try {
    const result = await getCandidateRankings({ page, limit, sortBy });
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error("listCandidates:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

async function getCandidate(req, res) {
  try {
    const data = await getCandidateDetail(req.params.username.toLowerCase());
    if (!data) {
      return res.status(404).json({ success: false, message: "Candidate not found or not analyzed." });
    }
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}

module.exports = { listCandidates, getCandidate };
