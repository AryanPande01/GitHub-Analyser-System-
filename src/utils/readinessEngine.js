const { computeInfluenceScore } = require("./influenceEngine");

function buildExplanation(domain, score, evidence) {
  if (score >= 75) return `Strong ${domain} readiness. ${evidence}`;
  if (score >= 50) return `Moderate ${domain} readiness with room to grow. ${evidence}`;
  if (score >= 25) return `Developing ${domain} foundation. ${evidence}`;
  return `Limited ${domain} signals in repositories. ${evidence}`;
}

function computeReadinessScores(skillAnalysis, repoAnalysis, profile, activity) {
  const getCategoryScore = (cat) => skillAnalysis.find((s) => s.category === cat)?.score || 0;
  const influence = computeInfluenceScore(profile);

  const frontendSkills = getCategoryScore("frontend");
  const backendSkills = getCategoryScore("backend");
  const databaseSkills = getCategoryScore("database");
  const devopsSkills = getCategoryScore("devops");
  const cloudSkills = getCategoryScore("cloud");

  const webRepos = repoAnalysis.filter((r) => r.domain === "Web Development").length;
  const backendRepos = repoAnalysis.filter((r) => r.domain === "Backend Systems").length;
  const devopsRepos = repoAnalysis.filter((r) => r.domain === "DevOps").length;

  const avgQuality =
    repoAnalysis.length > 0
      ? repoAnalysis.reduce((s, r) => s + r.quality_score, 0) / repoAnalysis.length
      : 0;

  const maxRepoPopularity = repoAnalysis.reduce((m, r) => Math.max(m, r.popularity_score), 0);

  const frontendScore = Math.round(
    clamp(frontendSkills * 0.55 + Math.min(webRepos * 10, 25) + avgQuality * 0.08)
  );

  const backendScore = Math.round(
    clamp(
      backendSkills * 0.45 +
        Math.min(backendRepos * 10, 25) +
        maxRepoPopularity * 0.25 +
        influence.score * 0.2
    )
  );

  const databaseScore = Math.round(
    clamp(databaseSkills * 0.65 + (databaseSkills > 0 ? 12 : 0) + influence.score * 0.08)
  );

  const devopsScore = Math.round(
    clamp(devopsSkills * 0.45 + cloudSkills * 0.2 + Math.min(devopsRepos * 12, 20) + influence.score * 0.1)
  );

  const systemDesignScore = Math.round(
    clamp(
      avgQuality * 0.25 +
        maxRepoPopularity * 0.3 +
        influence.score * 0.35 +
        backendScore * 0.1
    )
  );

  const problemSolvingScore = Math.round(
    clamp(
      (activity?.productivity_score || 35) * 0.25 +
        Math.min(profile.public_repos || 0, 20) +
        influence.score * 0.35 +
        maxRepoPopularity * 0.15 +
        avgQuality * 0.1
    )
  );

  const scores = {
    frontend_score: frontendScore,
    backend_score: backendScore,
    database_score: databaseScore,
    devops_score: devopsScore,
    system_design_score: systemDesignScore,
    problem_solving_score: problemSolvingScore,
  };

  const rawOverall = Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length;
  const overall = Math.round(clamp(rawOverall * 0.65 + influence.score * 0.35) * 100) / 100;

  const explanations = {
    frontend: buildExplanation("frontend", frontendScore, `${webRepos} web repos; influence tier: ${influence.tier}.`),
    backend: buildExplanation("backend", backendScore, `${backendRepos} backend/systems repos; top repo impact factored in.`),
    database: buildExplanation("database", databaseScore, databaseSkills > 40 ? "Database stack detected in repos." : "Limited database project evidence."),
    devops: buildExplanation("DevOps", devopsScore, devopsRepos > 0 ? "Infra/tooling repos found." : "Add CI/CD and deployment projects."),
    system_design: buildExplanation("system design", systemDesignScore, `Influence ${influence.score}/100; flagship project depth considered.`),
    problem_solving: buildExplanation("problem solving", problemSolvingScore, `Portfolio impact and activity consistency weighted.`),
  };

  return {
    ...scores,
    overall_score: overall,
    influence_score: influence.score,
    influence_tier: influence.tier,
    explanations,
  };
}

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

module.exports = { computeReadinessScores };
