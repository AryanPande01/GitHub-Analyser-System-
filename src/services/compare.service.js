const { getFullAnalysis } = require("../models/analysis.model");

async function compareDevelopers(usernames) {
  const profiles = await Promise.all(
    usernames.map(async (u) => {
      const data = await getFullAnalysis(u.toLowerCase());
      return { username: u.toLowerCase(), data };
    })
  );

  const missing = profiles.filter((p) => !p.data).map((p) => p.username);
  if (missing.length) {
    const err = new Error(`Profiles not analyzed: ${missing.join(", ")}`);
    err.code = "NOT_FOUND";
    err.missing = missing;
    throw err;
  }

  const comparison = profiles.map((p) => ({
    username: p.username,
    followers: p.data.profile.followers,
    total_stars: p.data.profile.total_stars,
    public_repos: p.data.profile.public_repos,
    overall_readiness: p.data.readiness?.overall_score || 0,
    productivity: p.data.activity?.productivity_score || 0,
    top_skills: (p.data.skills || [])
      .flatMap((s) => s.skills || [])
      .slice(0, 10),
    readiness_breakdown: p.data.readiness
      ? {
          frontend: p.data.readiness.frontend_score,
          backend: p.data.readiness.backend_score,
          database: p.data.readiness.database_score,
          devops: p.data.readiness.devops_score,
          system_design: p.data.readiness.system_design_score,
          problem_solving: p.data.readiness.problem_solving_score,
        }
      : {},
    top_repos: (p.data.repositories || []).slice(0, 3).map((r) => ({
      name: r.repo_name,
      stars: r.stars,
      quality: r.quality_score,
    })),
  }));

  const winner = {
    stars: [...comparison].sort((a, b) => b.total_stars - a.total_stars)[0]?.username,
    readiness: [...comparison].sort((a, b) => b.overall_readiness - a.overall_readiness)[0]?.username,
    activity: [...comparison].sort((a, b) => b.productivity - a.productivity)[0]?.username,
  };

  return {
    compared: usernames,
    developers: comparison,
    summary: {
      highest_stars: winner.stars,
      highest_readiness: winner.readiness,
      highest_activity: winner.activity,
    },
    generated_at: new Date().toISOString(),
  };
}

module.exports = { compareDevelopers };
