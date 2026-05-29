const { pool } = require("../config/db");
const { getFullAnalysis } = require("../models/analysis.model");
const { getPrimaryOrientation, parseTopLanguages } = require("../utils/influenceEngine");

async function getCandidateRankings({ page = 1, limit = 20, sortBy = "overall_score" } = {}) {
  const offset = (page - 1) * limit;
  const allowed = ["overall_score", "frontend_score", "backend_score", "productivity_score", "influence"];
  const sort = allowed.includes(sortBy) ? sortBy : "overall_score";

  let orderClause = "r.overall_score DESC";
  if (sort === "productivity_score") orderClause = "a.productivity_score DESC";
  else if (sort === "influence") orderClause = "p.total_stars DESC";
  else if (sort !== "overall_score") orderClause = `r.${sort} DESC`;

  const [rows] = await pool.query(
    `SELECT p.username, p.avatar_url, p.bio, p.location, p.company, p.top_languages,
            p.followers, p.total_stars, p.public_repos, p.hireable,
            r.overall_score, r.frontend_score, r.backend_score, r.devops_score,
            r.explanations,
            a.productivity_score,
            (SELECT AVG(ra.quality_score) FROM repository_analysis ra WHERE ra.username = p.username) AS avg_repo_quality
     FROM profiles p
     INNER JOIN readiness_scores r ON r.profile_id = p.id
     LEFT JOIN activity_analytics a ON a.profile_id = p.id
     ORDER BY ${orderClause}
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const [[{ total }]] = await pool.execute(
    `SELECT COUNT(*) as total FROM profiles p
     INNER JOIN readiness_scores r ON r.profile_id = p.id`
  );

  const candidates = rows.map((row, index) => {
    const explanations = parseJson(row.explanations);
    const influenceScore = explanations?.influence_score || estimateInfluence(row);

    return {
      rank: offset + index + 1,
      username: row.username,
      avatar_url: row.avatar_url,
      bio: row.bio,
      location: row.location,
      company: row.company,
      hireable: !!row.hireable,
      scores: {
        overall_readiness: parseFloat(row.overall_score) || 0,
        frontend: parseFloat(row.frontend_score) || 0,
        backend: parseFloat(row.backend_score) || 0,
        devops: parseFloat(row.devops_score) || 0,
        productivity: parseFloat(row.productivity_score) || 0,
        repository_quality: Math.round(parseFloat(row.avg_repo_quality) || 0),
        influence: influenceScore,
      },
      stats: {
        followers: row.followers,
        total_stars: row.total_stars,
        public_repos: row.public_repos,
      },
      orientation: buildOrientation(row),
      hiring_recommendation: getHiringRecommendation(row, influenceScore),
      technical_summary: buildTechnicalSummary(row),
    };
  });

  return { candidates, total, page, limit, totalPages: Math.ceil(total / limit) };
}

async function getCandidateDetail(username) {
  const analysis = await getFullAnalysis(username);
  if (!analysis) return null;

  const avgQuality =
    analysis.repositories?.length > 0
      ? analysis.repositories.reduce((s, r) => s + r.quality_score, 0) / analysis.repositories.length
      : 0;

  const influence = analysis.readiness?.influence_score || 0;

  return {
    username,
    profile: analysis.profile,
    scores: analysis.readiness,
    skills: analysis.skills,
    top_projects: (analysis.repositories || []).slice(0, 5),
    insights: analysis.insights,
    activity: analysis.activity,
    orientation: getPrimaryOrientation(analysis.skills || [], analysis.profile),
    hiring_recommendation: getHiringRecommendation(
      {
        overall_score: analysis.readiness?.overall_score,
        avg_repo_quality: avgQuality,
        productivity_score: analysis.activity?.productivity_score,
        hireable: analysis.profile.hireable,
        total_stars: analysis.profile.total_stars,
        followers: analysis.profile.followers,
      },
      influence
    ),
    technical_summary: buildTechnicalSummary({
      overall_score: analysis.readiness?.overall_score,
      frontend_score: analysis.readiness?.frontend_score,
      backend_score: analysis.readiness?.backend_score,
      total_stars: analysis.profile.total_stars,
      top_languages: analysis.profile.top_languages,
    }),
  };
}

function getHiringRecommendation(row, influenceScore) {
  const score = parseFloat(row.overall_score) || 0;
  const quality = parseFloat(row.avg_repo_quality) || 0;
  const stars = row.total_stars || 0;
  const followers = row.followers || 0;
  const influence = influenceScore || estimateInfluence(row);

  if (influence >= 85 || stars >= 10000 || followers >= 50000) {
    return "Exceptional Profile — industry-leading open source impact";
  }
  if (score >= 75 && quality >= 55) return "Strong Hire — well-rounded technical profile";
  if (score >= 60 || (influence >= 55 && quality >= 45)) {
    return "Interview Recommended — solid technical foundation";
  }
  if (score >= 45 || influence >= 40) return "Consider — potential with targeted mentorship";
  return "Early Stage — building portfolio depth";
}

function buildOrientation(row) {
  const langs = parseTopLanguages(row.top_languages);
  const topLang = langs[0]?.lang;
  const fe = parseFloat(row.frontend_score) || 0;
  const be = parseFloat(row.backend_score) || 0;

  if (["C", "C++", "Rust", "Assembly"].includes(topLang)) return "systems & infrastructure";
  if (Math.abs(fe - be) <= 12) return "full-stack";
  if (be > fe + 10) return "backend focused";
  if (fe > be + 10) return "frontend focused";
  return "generalist";
}

function buildTechnicalSummary(row) {
  const parts = [];
  const overall = parseFloat(row.overall_score) || 0;
  const langs = parseTopLanguages(row.top_languages);
  const orientation = buildOrientation(row);

  if (overall >= 70) parts.push("High readiness");
  parts.push(orientation);

  if (langs.length) parts.push(`Primary: ${langs.slice(0, 2).map((l) => l.lang).join(", ")}`);
  if (row.total_stars > 100) parts.push(`${formatNumber(row.total_stars)} stars`);

  return parts.join(" · ");
}

function estimateInfluence(row) {
  const stars = row.total_stars || 0;
  const followers = row.followers || 0;
  return Math.min(100, Math.round(Math.log10(stars + 1) * 12 * 0.55 + Math.log10(followers + 1) * 14 * 0.45));
}

function formatNumber(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function parseJson(val) {
  if (!val) return null;
  if (typeof val === "object") return val;
  try { return JSON.parse(val); } catch { return null; }
}

module.exports = { getCandidateRankings, getCandidateDetail };
