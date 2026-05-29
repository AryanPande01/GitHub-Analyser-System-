const { getPrimaryOrientation } = require("../utils/influenceEngine");

function detectIntent(message, history = []) {
  const msg = message.toLowerCase().trim();

  if (/^(hi|hello|hey|thanks|thank you)\b/.test(msg)) return "greeting";

  if (
    /worth|hiring|hireable|employ|get hired|good enough|recruiter|will i get|not enough|portfolio enough|current project|my project|existing project/.test(msg) &&
    (/project|portfolio|profile|github|skill|ready|star|repo/.test(msg) || history.length > 0)
  ) {
    return "hiring_worthiness";
  }

  if (
    /(what|which).*(project|build|create)|build next|project idea|should i (build|make|create)|new project|side project|what to build/.test(msg) &&
    !/worth|hiring|good enough|current project|existing project|my project/.test(msg)
  ) {
    return "project_ideas";
  }

  if (/backend.*(skill|strong|best)|strongest backend|backend skill/.test(msg)) return "skills_backend";
  if (/frontend.*(skill|strong|best)|strongest frontend|frontend skill/.test(msg)) return "skills_frontend";
  if (/interview|ready for|prepared|readiness/.test(msg)) return "interview";
  if (/learn|roadmap|improve|gap|weak|missing skill/.test(msg)) return "learning";
  if (/career|path|role|job|intern|sde|engineer/.test(msg)) return "career";
  if (/repo|repository|github profile|my code/.test(msg) && /review|show|list|best|top/.test(msg)) return "repo_review";

  if (history.length > 0 && /^(but|however|what about|also|and|so|then|okay|ok)\b/.test(msg)) {
    return "followup";
  }

  return "general";
}

function formatRepos(repos, limit = 6) {
  return (repos || []).slice(0, limit).map((r, i) => {
    const quality = Math.round(r.quality_score || 0);
    const label = quality >= 70 ? "strong" : quality >= 50 ? "decent" : "needs polish";
    return `${i + 1}. **${r.repo_name}** (${r.language || "N/A"}, ${r.stars || 0}★, ${r.domain}) — quality ${quality}/100, ${label}`;
  });
}

function generateSmartChatReply(username, message, context, history = []) {
  const intent = detectIntent(message, history);
  const skills = context.skills || [];
  const readiness = context.readiness || {};
  const insights = context.insights || {};
  const profile = context.profile || {};
  const repos = context.repositories || [];
  const orientation = getPrimaryOrientation(skills, profile);

  const backendSkills = skills.find((s) => s.category === "backend")?.skills || [];
  const frontendSkills = skills.find((s) => s.category === "frontend")?.skills || [];
  const lowCategories = skills.filter((s) => s.score < 50).map((s) => s.category);
  const topRepos = formatRepos(repos);
  const stars = Number(profile.total_stars) || 0;
  const overall = readiness.overall_score ?? 0;
  const lastUserMsg = [...history].reverse().find((h) => h.role === "user")?.message?.toLowerCase() || "";

  switch (intent) {
    case "greeting":
      return `Hey! I'm your career coach for **@${username}**. I've reviewed your GitHub — ${profile.public_repos} repos, ${stars} stars, **${orientation}** profile, readiness **${overall}/100**.\n\nAsk me anything: project ideas, whether your portfolio is hire-ready, interview prep, skill gaps, or career direction.`;

    case "hiring_worthiness": {
      const level =
        overall >= 70 ? "mid-level and strong internship pipelines" :
        overall >= 50 ? "internships and junior/new-grad roles" :
        overall >= 35 ? "internships with mentorship, or early-stage startups" :
        "learning-focused roles while you strengthen your portfolio";

      const repoBlock = topRepos.length
        ? `\n\nYour current projects:\n${topRepos.join("\n")}`
        : "\n\nYou don't have much public repo data yet — building 2-3 solid projects should be the priority.";

      const honest =
        stars === 0 && overall < 50
          ? "Stars aren't everything, especially early in your career — **recruiters care more about project depth, code quality, and whether you can explain your work** in interviews."
          : stars > 100
            ? "Your star count shows real traction — that's a strong signal to recruiters."
            : "At your stage, **project quality and how you present them matter more than star count**.";

      const improvements = [];
      if (lowCategories.includes("frontend")) improvements.push("Add one polished frontend layer (React/Next.js dashboard) to an existing backend project");
      if (lowCategories.includes("devops")) improvements.push("Add CI/CD + README with setup instructions to your best repo");
      if (repos.some((r) => !r.metadata?.topics?.length)) improvements.push("Add topics, descriptions, and demo screenshots to repos that lack them");
      if (improvements.length === 0) improvements.push("Prepare 2-minute 'deep dive' stories for your top 2 repos for interviews");

      return `Honest answer: **Yes, your projects can be worth hiring for — but it depends on the role level.**${repoBlock}\n\n${honest}\n\nFor **${level}**, your readiness score of **${overall}/100** suggests you're ${overall >= 50 ? "on a credible path" : "still building foundation — not unhireable, but expect to compete harder"}.\n\n**What would make your existing projects more hire-worthy:**\n${improvements.map((x) => `• ${x}`).join("\n")}\n\nWant me to review a specific repo or tell you what role level to target?`;
    }

    case "project_ideas": {
      const ideas = [];
      if (orientation.includes("systems") || backendSkills.some((s) => s.includes("c"))) {
        ideas.push("A high-performance CLI tool in C/Rust/Go solving a real developer workflow problem");
      }
      if (lowCategories.includes("frontend")) {
        ideas.push(`A React/Next.js dashboard for **${repos[0]?.repo_name || "your best backend project"}**`);
      }
      if (lowCategories.includes("devops")) {
        ideas.push("Dockerize + GitHub Actions CI for your strongest repo with automated tests");
      }
      if (lowCategories.includes("ai_ml")) {
        ideas.push("An AI-powered feature (RAG, classification, or recommendation) integrated into a full-stack app");
      }
      ideas.push(`Extend **${repos[0]?.repo_name || "your top repo"}** with auth, tests, and API documentation`);
      ideas.push("A portfolio-worthy capstone: problem → architecture → implementation → deployed demo");

      return `Based on your **${orientation}** stack (${backendSkills.slice(0, 3).join(", ") || "varied"}) and gaps in **${lowCategories.join(", ") || "depth"}**, here are tailored ideas:\n\n${ideas.slice(0, 5).map((idea, i) => `${i + 1}. ${idea}`).join("\n\n")}\n\nPick one you can finish in 4–8 weeks with a great README and demo. Quality over quantity — one flagship project beats five half-finished ones.`;
    }

    case "skills_backend":
      return backendSkills.length
        ? `Your strongest backend signals: **${backendSkills.slice(0, 6).join(", ")}** (readiness **${readiness.backend_score}/100**).\n\nHighlight **${repos[0]?.repo_name || "your best repo"}** in interviews — walk through data flow, API design, and tradeoffs you made. That's what separates candidates at the ${orientation} level.`
        : `Backend skills are still emerging (${readiness.backend_score}/100). Build one API-first project with a database, auth, and clear README — that's the fastest way to signal backend capability.`;

    case "skills_frontend":
      return frontendSkills.length
        ? `Top frontend tech detected: **${frontendSkills.slice(0, 6).join(", ")}** (readiness **${readiness.frontend_score}/100**).`
        : `Limited frontend evidence (${readiness.frontend_score}/100). A polished React/Next.js UI on top of an existing project would strengthen your profile quickly.`;

    case "interview":
      return `Interview readiness: **${overall}/100** (${readiness.influence_tier || "standard"} tier).\n\n**Strongest areas:** System Design ${readiness.system_design_score}, Backend ${readiness.backend_score}, Problem Solving ${readiness.problem_solving_score}.\n\n**Focus prep on:**\n• 2–3 deep-dive stories from ${repos.slice(0, 2).map((r) => r.repo_name).join(" and ") || "your best repos"}\n• ${insights.interview_suggestions?.[0] || "Practice explaining tradeoffs, not just features"}\n• System design fundamentals if targeting product companies`;

    case "learning":
      return `Priority learning areas for **@${username}**:\n\n${(insights.missing_skills || lowCategories.map((c) => `Strengthen ${c}`)).slice(0, 4).map((x) => `• ${x}`).join("\n")}\n\nYour orientation is **${orientation}**. Check the **Roadmap** page for structured 1/3/6-month plans, or ask me to suggest a weekly schedule.`;

    case "career":
      return `Career paths that fit your profile (${stars} stars, ${orientation}):\n\n${(insights.career_paths || ["Full Stack Developer", "Backend Developer", "SDE Intern"]).slice(0, 4).map((p, i) => `${i + 1}. **${p}**`).join("\n")}\n\nAt readiness **${overall}/100**, I'd target ${overall >= 60 ? "mid-level or strong new-grad pipelines" : overall >= 40 ? "internships and junior roles" : "internships while building 1–2 flagship projects"}. What company type interests you — startup, product, or service?`;

    case "repo_review":
      return `Here's your repo breakdown:\n\n${topRepos.join("\n") || "No repos analyzed yet."}\n\n**Best to showcase:** ${repos[0]?.repo_name || "N/A"}. **Needs most work:** ${repos[repos.length - 1]?.repo_name || "repos lacking READMEs/docs"}.`;

    case "followup": {
      if (/worth|hiring|good enough|current project|my project/.test(message.toLowerCase())) {
        return generateSmartChatReply(username, "are my current projects worth hiring", context, history);
      }
      if (/project|build|idea/.test(message.toLowerCase()) || /project|build/.test(lastUserMsg)) {
        return generateSmartChatReply(username, "what project should I build next", context, history);
      }
      return `Good follow-up. To give you a precise answer about "${message}" — your profile shows **${overall}/100** readiness, **${orientation}** orientation, and top repo **${repos[0]?.repo_name || "N/A"}**.\n\nCould you be more specific? For example: hiring readiness, a specific repo, interview prep, or skill gaps?`;
    }

    default:
      return `For **@${username}** (${orientation}, ${overall}/100 readiness, ${stars} stars):\n\n**Strengths:** ${(insights.strengths || ["Active GitHub presence"]).slice(0, 2).join("; ")}\n**Gaps:** ${(insights.weaknesses || lowCategories.map((c) => c)).slice(0, 2).join("; ")}\n\nYour question: "${message}" — I can help with project ideas, hiring readiness, interview prep, skills, or career paths. What would you like to dig into?`;
  }
}

module.exports = { detectIntent, generateSmartChatReply };
