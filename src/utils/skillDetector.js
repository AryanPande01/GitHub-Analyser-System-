const SKILL_MAP = {
  frontend: [
    "html", "css", "javascript", "typescript", "react", "next.js", "nextjs", "vue", "angular",
    "tailwind", "sass", "scss", "jsx", "tsx", "svelte",
  ],
  backend: [
    "node.js", "nodejs", "express", "spring boot", "spring", "django", "flask", "fastapi",
    "java", "python", "go", "golang", "ruby", "rails", "php", "laravel", "nestjs", ".net",
    "kernel", "server", "api", "microservice",
  ],
  database: ["mysql", "postgresql", "postgres", "mongodb", "redis", "sqlite", "dynamodb", "prisma"],
  devops: [
    "docker", "kubernetes", "k8s", "ci/cd", "github actions", "jenkins", "terraform", "ansible",
    "nginx", "helm", "git",
  ],
  cloud: ["aws", "azure", "gcp", "google cloud", "lambda", "ec2", "s3", "cloudflare"],
  ai_ml: [
    "tensorflow", "pytorch", "scikit-learn", "sklearn", "langchain", "openai", "huggingface",
    "keras", "pandas", "numpy", "jupyter", "mlflow",
  ],
};

const SYSTEMS_LANGUAGES = new Set(["C", "C++", "Rust", "Assembly", "Go", "Shell"]);

const LANG_ALIASES = {
  JavaScript: ["javascript", "js"],
  TypeScript: ["typescript", "ts"],
  HTML: ["html"],
  CSS: ["css"],
  Python: ["python"],
  Java: ["java"],
  Go: ["go", "golang"],
  C: ["c"],
  "C++": ["c++", "cpp"],
  "C#": ["c#", "csharp"],
  Ruby: ["ruby"],
  PHP: ["php"],
  Swift: ["swift"],
  Kotlin: ["kotlin"],
  Rust: ["rust"],
  Shell: ["shell", "bash"],
  Assembly: ["assembly"],
};

function normalize(text) {
  return (text || "").toLowerCase();
}

function repoWeight(repo) {
  const stars = repo.stargazers_count || 0;
  return Math.log10(stars + 1) + 1;
}

function collectRepoSignals(repo) {
  const parts = [repo.name, repo.description, repo.language, ...(repo.topics || [])];
  return normalize(parts.filter(Boolean).join(" "));
}

function detectSkillsFromRepos(repos) {
  const weighted = {
    frontend: new Map(),
    backend: new Map(),
    database: new Map(),
    devops: new Map(),
    cloud: new Map(),
    ai_ml: new Map(),
  };

  function addSkill(category, skill, weight) {
    const key = skill.toLowerCase();
    weighted[category].set(key, (weighted[category].get(key) || 0) + weight);
  }

  for (const repo of repos) {
    const signal = collectRepoSignals(repo);
    const weight = repoWeight(repo);

    for (const [category, keywords] of Object.entries(SKILL_MAP)) {
      for (const kw of keywords) {
        if (signal.includes(kw)) {
          addSkill(category, kw, weight);
        }
      }
    }

    if (repo.language) {
      const lang = repo.language;
      for (const [label, aliases] of Object.entries(LANG_ALIASES)) {
        if (aliases.some((a) => lang.toLowerCase() === a || lang === label)) {
          if (["JavaScript", "TypeScript", "HTML", "CSS"].includes(label)) {
            addSkill("frontend", label, weight);
          } else {
            addSkill("backend", label, weight);
          }
          if (SYSTEMS_LANGUAGES.has(label)) {
            addSkill("backend", `${label} (systems)`, weight * 1.2);
          }
        }
      }
      if (lang === "C" || lang === "C++") {
        addSkill("devops", "systems programming", weight * 0.5);
      }
    }
  }

  const categoryScores = {};
  const maxWeight = repos.reduce((s, r) => s + repoWeight(r), 0) || 1;

  for (const category of Object.keys(weighted)) {
    const entries = [...weighted[category].entries()];
    const totalWeight = entries.reduce((s, [, w]) => s + w, 0);
    const skills = entries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([skill]) => skill);

    const score = Math.min(100, Math.round((totalWeight / maxWeight) * 100));
    categoryScores[category] = {
      skills,
      detected_count: skills.length,
      score: Math.max(score, skills.length > 0 ? 15 : 0),
    };
  }

  return categoryScores;
}

module.exports = { detectSkillsFromRepos, SKILL_MAP };
