const { getFullAnalysis } = require("../models/analysis.model");

async function generateResumeData(username) {
  const analysis = await getFullAnalysis(username);
  if (!analysis) return null;

  const { profile, skills, repositories, readiness, insights, activity } = analysis;

  const topLanguages = typeof profile.top_languages === "string"
    ? JSON.parse(profile.top_languages || "[]")
    : profile.top_languages || [];

  const projects = (repositories || [])
    .filter((r) => !r.is_fork)
    .sort((a, b) => b.stars - a.stars)
    .slice(0, 6)
    .map((r) => ({
      name: r.repo_name,
      url: r.repo_url,
      language: r.language,
      domain: r.domain,
      stars: r.stars,
      highlights: [
        `Quality score: ${r.quality_score}/100`,
        r.language ? `Built with ${r.language}` : null,
      ].filter(Boolean),
    }));

  const skillSections = (skills || []).map((s) => ({
    category: s.category,
    skills: s.skills,
    proficiency: s.score >= 70 ? "Advanced" : s.score >= 40 ? "Intermediate" : "Beginner",
  }));

  return {
    format: "ats-json-v1",
    personal: {
      name: profile.username,
      github: profile.github_url,
      location: profile.location,
      bio: profile.bio,
      avatar: profile.avatar_url,
      hireable: !!profile.hireable,
    },
    summary: profile.bio || `Software developer with ${profile.public_repos} public repositories and ${profile.total_stars} stars on GitHub.`,
    skills: skillSections,
    languages: topLanguages,
    projects,
    metrics: {
      followers: profile.followers,
      total_stars: profile.total_stars,
      account_age_days: profile.account_age_days,
      productivity_score: activity?.productivity_score,
      overall_readiness: readiness?.overall_score,
    },
    achievements: [
      profile.most_starred_repo
        ? `Most starred project: ${profile.most_starred_repo} (${profile.most_starred_repo_stars} stars)`
        : null,
      profile.total_stars > 0 ? `${profile.total_stars} total repository stars` : null,
      profile.original_repos > 0 ? `${profile.original_repos} original repositories` : null,
    ].filter(Boolean),
    recommendations: insights
      ? {
          resume: insights.resume_suggestions,
          portfolio: insights.portfolio_suggestions,
        }
      : null,
    export_note: "Structured for ATS parsing. PDF/DOCX export can be added via a document service.",
  };
}

module.exports = { generateResumeData };
