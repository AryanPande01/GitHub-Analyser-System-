const SYSTEMS_LANGUAGES = new Set(["C", "C++", "Rust", "Assembly", "Go"]);

const DOMAIN_KEYWORDS = {
  "Backend Systems": [
    "api", "server", "backend", "express", "django", "flask", "spring", "microservice",
    "kernel", "database", "protocol", "compiler", "runtime",
  ],
  "Web Development": ["react", "vue", "angular", "next", "html", "css", "frontend", "tailwind", "spa"],
  "Mobile Development": ["android", "ios", "flutter", "react-native", "swift", "kotlin mobile"],
  "AI/ML": ["ml", "ai", "tensorflow", "pytorch", "neural", "model", "nlp", "llm", "langchain"],
  DevOps: ["docker", "kubernetes", "ci", "cd", "terraform", "deploy", "infra", "git"],
  "Data Science": ["data", "analytics", "pandas", "notebook", "visualization", "etl"],
  "Open Source Tools": ["cli", "tool", "library", "sdk", "plugin", "utility", "linux"],
};

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function classifyDomain(repo) {
  const signal = [repo.name, repo.description, repo.language, ...(repo.topics || [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (SYSTEMS_LANGUAGES.has(repo.language)) {
    return repo.language === "Go" && signal.includes("web") ? "Backend Systems" : "Backend Systems";
  }

  let best = "Open Source Tools";
  let bestScore = 0;

  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    const score = keywords.filter((k) => signal.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      best = domain;
    }
  }

  if (repo.language === "Python" && bestScore === 0) {
    best = signal.includes("api") || signal.includes("server") ? "Backend Systems" : "Data Science";
  }
  if ((repo.language === "JavaScript" || repo.language === "TypeScript") && bestScore === 0) {
    best = "Web Development";
  }

  return best;
}

function analyzeRepository(repo) {
  const stars = repo.stargazers_count || 0;
  const forks = repo.forks_count || 0;
  const watchers = repo.watchers_count || 0;
  const size = repo.size || 0;
  const openIssues = repo.open_issues_count || 0;
  const hasDescription = !!repo.description;
  const topicCount = (repo.topics || []).length;

  const daysSincePush =
    (Date.now() - new Date(repo.pushed_at || repo.updated_at).getTime()) / (1000 * 60 * 60 * 24);

  const complexityScore = clamp(
    Math.log10(size + 10) * 18 + topicCount * 5 + (repo.language ? 12 : 0) + (SYSTEMS_LANGUAGES.has(repo.language) ? 15 : 0)
  );

  const activityScore = clamp(
    daysSincePush < 30 ? 95 : daysSincePush < 90 ? 80 : daysSincePush < 180 ? 65 : daysSincePush < 365 ? 45 : 25
  );

  const popularityScore = clamp(Math.log10(stars + 1) * 35 + Math.log10(forks + 1) * 18);

  const openSourceScore = clamp(
    (forks > 0 ? 25 : 0) +
      (stars > 1000 ? 35 : stars > 100 ? 28 : stars > 10 ? 20 : stars > 0 ? 12 : 0) +
      (!repo.fork ? 20 : 5) +
      (watchers > 0 ? 10 : 0)
  );

  const qualityScore = clamp(
    popularityScore * 0.35 +
      (hasDescription ? 15 : 5) +
      (topicCount > 0 ? 12 : 0) +
      complexityScore * 0.25 +
      activityScore * 0.15 +
      openSourceScore * 0.1
  );

  return {
    repo_name: repo.name,
    repo_url: repo.html_url,
    language: repo.language,
    domain: classifyDomain(repo),
    complexity_score: Math.round(complexityScore * 100) / 100,
    activity_score: Math.round(activityScore * 100) / 100,
    popularity_score: Math.round(popularityScore * 100) / 100,
    open_source_score: Math.round(openSourceScore * 100) / 100,
    quality_score: Math.round(qualityScore * 100) / 100,
    stars,
    forks,
    is_fork: !!repo.fork,
    metadata: {
      size_kb: size,
      open_issues: openIssues,
      topics: repo.topics || [],
      pushed_at: repo.pushed_at,
      created_at: repo.created_at,
    },
  };
}

function analyzeAllRepositories(repos) {
  return repos.map(analyzeRepository);
}

module.exports = { analyzeRepository, analyzeAllRepositories, classifyDomain };
