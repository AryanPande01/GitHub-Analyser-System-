function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function computeInfluenceScore(profile) {
  const stars = profile.total_stars || 0;
  const followers = profile.followers || 0;
  const repos = profile.public_repos || 0;

  const starScore = Math.min(100, Math.log10(stars + 1) * 12);
  const followerScore = Math.min(100, Math.log10(followers + 1) * 14);
  const depthScore = Math.min(30, repos * 2);

  const score = clamp(starScore * 0.55 + followerScore * 0.35 + depthScore * 0.1);
  const tier =
    score >= 85 ? "legendary" : score >= 70 ? "established" : score >= 50 ? "rising" : score >= 30 ? "developing" : "emerging";

  return { score: Math.round(score * 100) / 100, tier, starScore, followerScore };
}

function getPrimaryOrientation(skills, profile) {
  const fe = skills.find((s) => s.category === "frontend")?.score || 0;
  const be = skills.find((s) => s.category === "backend")?.score || 0;
  const devops = skills.find((s) => s.category === "devops")?.score || 0;
  const ai = skills.find((s) => s.category === "ai_ml")?.score || 0;

  const langs = parseTopLanguages(profile.top_languages);
  const systemsLangs = ["C", "C++", "Rust", "Assembly", "Go"];
  const hasSystems = langs.some((l) => systemsLangs.includes(l.lang));

  if (hasSystems && (profile.total_stars || 0) > 1000) return "systems & infrastructure";
  if (ai > fe && ai > be) return "AI/ML focused";
  if (devops > fe && devops > be) return "DevOps focused";
  if (Math.abs(fe - be) <= 12) return "full-stack";
  if (be > fe) return "backend focused";
  if (fe > be) return "frontend focused";
  return "generalist";
}

function parseTopLanguages(raw) {
  if (!raw) return [];
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch {
    return [];
  }
}

module.exports = { computeInfluenceScore, getPrimaryOrientation, parseTopLanguages };
