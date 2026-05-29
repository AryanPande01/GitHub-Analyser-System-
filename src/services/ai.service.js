const { isGeminiConfigured, generateContent, generateText } = require("../config/gemini");
const { getPrimaryOrientation } = require("../utils/influenceEngine");
const { generateSmartChatReply } = require("./chatEngine");
const { generateAllRoadmaps } = require("./roadmap.service");

const INSIGHTS_SYSTEM_PROMPT = `You are a senior engineering career coach analyzing GitHub developer profiles.
Respond ONLY with valid JSON matching the requested schema. Be specific, actionable, and professional.`;

const ROADMAP_SYSTEM_PROMPT = `You are a senior engineering career coach creating personalized learning roadmaps for developers based on their GitHub profile analysis.
Respond ONLY with valid JSON matching the requested schema. Be specific, actionable, and tailored to the developer's actual skills, gaps, repositories, and target role. Reference their real tech stack and projects where possible.`;

const CHAT_SYSTEM_PROMPT = `You are an expert software engineering career coach in a live chat with a developer about THEIR GitHub profile.

CRITICAL RULES:
1. Answer ONLY the user's latest question — read it carefully. Never repeat a previous answer.
2. If they ask whether their projects are "worth hiring" or good enough — evaluate their EXISTING repos honestly for employability. Do NOT suggest new project ideas unless they ask.
3. If they ask what to build next — give specific project ideas. Do NOT repeat hiring advice.
4. Use conversation history for follow-ups ("but...", "what about...") — address the new angle.
5. Be conversational, warm, and direct like Gemini/ChatGPT. Use paragraphs and bullet lists when helpful.
6. Ground answers in their profile data (repos, scores, skills) but don't dump the full profile.
7. Plain text only — no JSON. Bold with **asterisks** sparingly.`;

function buildProfileContext(username, context) {
  const { profile, skills, readiness, insights, repositories, activity } = context;

  const topRepos = (repositories || [])
    .slice(0, 10)
    .map((r) => `  • ${r.repo_name} — ${r.language || "N/A"}, ${r.stars}★, ${r.domain}, quality ${Math.round(r.quality_score)}/100`)
    .join("\n");

  const skillLines = (skills || [])
    .map((s) => `  • ${s.category}: ${(s.skills || []).slice(0, 8).join(", ") || "none detected"} (score ${s.score}/100)`)
    .join("\n");

  return `
=== GITHUB PROFILE: @${username} ===
Bio: ${profile.bio || "Not provided"}
Location: ${profile.location || "N/A"} | Company: ${profile.company || "N/A"}
Public repos: ${profile.public_repos} | Total stars: ${profile.total_stars?.toLocaleString()} | Followers: ${profile.followers?.toLocaleString()}
Account age: ${profile.account_age_days} days | Hireable: ${profile.hireable ? "Yes" : "No"}

=== READINESS SCORES (0–100) ===
Overall: ${readiness?.overall_score ?? "N/A"} | Tier: ${readiness?.influence_tier ?? "N/A"}
Frontend: ${readiness?.frontend_score} | Backend: ${readiness?.backend_score} | Database: ${readiness?.database_score}
DevOps: ${readiness?.devops_score} | System Design: ${readiness?.system_design_score} | Problem Solving: ${readiness?.problem_solving_score}

=== SKILLS ===
${skillLines || "  No skills detected"}

=== TOP REPOSITORIES ===
${topRepos || "  None"}

=== CAREER INSIGHTS ===
Strengths: ${(insights?.strengths || []).join(" | ") || "N/A"}
Weaknesses: ${(insights?.weaknesses || []).join(" | ") || "N/A"}
Missing skills: ${(insights?.missing_skills || []).join(" | ") || "N/A"}
Suggested career paths: ${(insights?.career_paths || []).join(" | ") || "N/A"}
Interview tips: ${(insights?.interview_suggestions || []).slice(0, 2).join(" | ") || "N/A"}

=== ACTIVITY ===
Consistency: ${activity?.contribution_consistency}% | Productivity: ${activity?.productivity_score}% | Trend: ${activity?.activity_trend}
`.trim();
}

function buildFallbackInsights(profile, skills, readiness) {
  const topSkills = skills
    .flatMap((s) => (s.skills || []).map((sk) => ({ skill: sk, category: s.category })))
    .slice(0, 8);

  const lowCategories = skills.filter((s) => s.score < 40).map((s) => s.category);
  const orientation = getPrimaryOrientation(skills, profile);

  return {
    strengths: [
      profile.total_stars > 1000
        ? `Major open-source impact with ${profile.total_stars.toLocaleString()} total stars`
        : profile.total_stars > 50
          ? `Growing open-source traction with ${profile.total_stars} stars`
          : "Active GitHub presence with public repositories",
      topSkills.length
        ? `Core stack: ${topSkills.slice(0, 4).map((t) => t.skill).join(", ")} (${orientation})`
        : "Consistent project portfolio",
      readiness?.overall_score > 60
        ? `Overall readiness ${readiness.overall_score}/100 (${readiness.influence_tier || "analyzed"} tier)`
        : "Foundation for growth across multiple domains",
    ],
    weaknesses: lowCategories.length
      ? [`Limited evidence in: ${lowCategories.join(", ")}`, "Some repositories lack descriptions and topics"]
      : ["Expand project documentation", "Increase contribution consistency"],
    missing_skills: lowCategories.map((c) => `Strengthen ${c} with dedicated projects`),
    career_paths: [
      orientation.includes("systems") ? "Systems Engineer" : null,
      readiness?.backend_score > readiness?.frontend_score ? "Backend Developer" : "Frontend Developer",
      "Full Stack Developer",
      profile.total_stars > 1000 ? "Open Source Maintainer / Staff Engineer" : "SDE Intern / New Grad",
    ].filter(Boolean),
    resume_suggestions: [
      "Lead with top repositories ranked by stars and technical depth",
      "Quantify impact: stars, forks, contributors",
      "List technologies extracted from repository analysis",
    ],
    portfolio_suggestions: [
      "Pin best 4-6 repositories on GitHub profile",
      "Add README badges and architecture diagrams to flagship projects",
      profile.has_website ? "Link personal site prominently" : "Add a portfolio website or blog link",
    ],
    interview_suggestions: [
      `System design focus (score: ${readiness?.system_design_score || "N/A"})`,
      "Prepare 2-3 deep-dive project stories from highest quality repos",
      "Practice coding problems aligned with target company bar",
    ],
    raw_response: { source: "rule-based-fallback" },
  };
}

function buildContextualChatReply(username, message, context, history = []) {
  return generateSmartChatReply(username, message, context, history);
}

async function generateCareerInsights(context) {
  const { profile, skills, readiness, repositories } = context;

  if (!isGeminiConfigured()) {
    return buildFallbackInsights(profile, skills, readiness);
  }

  const prompt = `Analyze this GitHub developer. Return JSON: strengths, weaknesses, missing_skills, career_paths, resume_suggestions, portfolio_suggestions, interview_suggestions (all string arrays).

Profile: ${JSON.stringify({
    username: profile.username,
    bio: profile.bio,
    followers: profile.followers,
    total_stars: profile.total_stars,
    public_repos: profile.public_repos,
  })}
Skills: ${JSON.stringify(skills.slice(0, 6))}
Readiness: ${JSON.stringify({ overall: readiness.overall_score, tier: readiness.influence_tier })}
Top repos: ${JSON.stringify(repositories?.slice(0, 5).map((r) => ({ name: r.repo_name, stars: r.stars, domain: r.domain })))}`;

  try {
    const result = await generateContent(prompt, INSIGHTS_SYSTEM_PROMPT, { maxTokens: 2048 });
    return { ...result, raw_response: { source: "gemini" } };
  } catch (err) {
    console.warn("Gemini insights fallback:", err.message);
    return buildFallbackInsights(profile, skills, readiness);
  }
}

const EXPECTED_DURATIONS = ["1_month", "3_month", "6_month"];

const DURATION_PHASE_TEMPLATES = {
  "1_month": [
    { label: "Week 1-2", weeks: "1-2" },
    { label: "Week 3-4", weeks: "3-4" },
  ],
  "3_month": [
    { label: "Month 1", weeks: "1-4" },
    { label: "Month 2", weeks: "5-8" },
    { label: "Month 3", weeks: "9-12" },
  ],
  "6_month": [
    { label: "Month 1-2", weeks: "1-8" },
    { label: "Month 3-4", weeks: "9-16" },
    { label: "Month 5-6", weeks: "17-24" },
  ],
};

function normalizeRoadmapPhases(duration, phases = []) {
  const template = DURATION_PHASE_TEMPLATES[duration] || DURATION_PHASE_TEMPLATES["3_month"];
  return template.map((t, i) => {
    const phase = phases[i] || {};
    return {
      label: phase.label || t.label,
      weeks: phase.weeks || t.weeks,
      goals: Array.isArray(phase.goals) ? phase.goals.slice(0, 5) : [],
      resources: Array.isArray(phase.resources) ? phase.resources.slice(0, 4) : [],
    };
  });
}

function normalizeAiRoadmaps(roadmaps, targetRole) {
  const byDuration = new Map(
    (Array.isArray(roadmaps) ? roadmaps : [])
      .filter((r) => r && EXPECTED_DURATIONS.includes(r.duration))
      .map((r) => [r.duration, r])
  );

  return EXPECTED_DURATIONS.map((duration) => {
    const rm = byDuration.get(duration) || {};
    return {
      duration,
      target_role: targetRole,
      focus_areas: Array.isArray(rm.focus_areas) ? rm.focus_areas.slice(0, 6) : [],
      phases: normalizeRoadmapPhases(duration, rm.phases),
    };
  });
}

async function generateRoadmaps(context, targetRole) {
  const { profile, skills, readiness, repositories, activity, insights } = context;
  const weaknesses = insights?.weaknesses || [];

  if (!isGeminiConfigured()) {
    return generateAllRoadmaps(targetRole, skills, readiness, weaknesses);
  }

  const prompt = `Create personalized learning roadmaps for a GitHub developer targeting the role "${targetRole}".

Developer profile:
${JSON.stringify({
    username: profile.username,
    bio: profile.bio,
    followers: profile.followers,
    total_stars: profile.total_stars,
    public_repos: profile.public_repos,
  })}

Skills: ${JSON.stringify(skills.slice(0, 8))}
Readiness scores: ${JSON.stringify({
    overall: readiness.overall_score,
    frontend: readiness.frontend_score,
    backend: readiness.backend_score,
    database: readiness.database_score,
    devops: readiness.devops_score,
    system_design: readiness.system_design_score,
    problem_solving: readiness.problem_solving_score,
  })}
Top repos: ${JSON.stringify(
    repositories?.slice(0, 6).map((r) => ({
      name: r.repo_name,
      language: r.language,
      domain: r.domain,
      quality: Math.round(r.quality_score),
      stars: r.stars,
    }))
  )}
Activity: ${JSON.stringify({
    consistency: activity?.contribution_consistency,
    productivity: activity?.productivity_score,
    trend: activity?.activity_trend,
  })}
Strengths: ${JSON.stringify((insights?.strengths || []).slice(0, 4))}
Weaknesses: ${JSON.stringify(weaknesses.slice(0, 4))}
Missing skills: ${JSON.stringify((insights?.missing_skills || []).slice(0, 5))}
Career paths: ${JSON.stringify((insights?.career_paths || []).slice(0, 3))}

Return JSON with this exact structure:
{
  "roadmaps": [
    {
      "duration": "1_month",
      "focus_areas": ["3-5 specific focus areas"],
      "phases": [
        { "label": "Week 1-2", "weeks": "1-2", "goals": ["3-4 specific goals"], "resources": ["2-3 resources"] },
        { "label": "Week 3-4", "weeks": "3-4", "goals": ["..."], "resources": ["..."] }
      ]
    },
    {
      "duration": "3_month",
      "focus_areas": ["..."],
      "phases": [
        { "label": "Month 1", "weeks": "1-4", "goals": ["..."], "resources": ["..."] },
        { "label": "Month 2", "weeks": "5-8", "goals": ["..."], "resources": ["..."] },
        { "label": "Month 3", "weeks": "9-12", "goals": ["..."], "resources": ["..."] }
      ]
    },
    {
      "duration": "6_month",
      "focus_areas": ["..."],
      "phases": [
        { "label": "Month 1-2", "weeks": "1-8", "goals": ["..."], "resources": ["..."] },
        { "label": "Month 3-4", "weeks": "9-16", "goals": ["..."], "resources": ["..."] },
        { "label": "Month 5-6", "weeks": "17-24", "goals": ["..."], "resources": ["..."] }
      ]
    }
  ]
}

Goals must address this developer's specific skill gaps and build on their existing projects. Avoid generic advice.`;

  try {
    const result = await generateContent(prompt, ROADMAP_SYSTEM_PROMPT, { maxTokens: 4096 });
    const normalized = normalizeAiRoadmaps(result.roadmaps || result, targetRole);
    const hasContent = normalized.some((r) => r.focus_areas.length && r.phases.some((p) => p.goals.length));
    if (!hasContent) throw new Error("Gemini returned empty roadmap content");
    return normalized.map((r) => ({ ...r, source: "gemini" }));
  } catch (err) {
    console.warn("Gemini roadmap fallback:", err.message);
    return generateAllRoadmaps(targetRole, skills, readiness, weaknesses);
  }
}

async function generateChatResponse(username, message, context, history = []) {
  const smartFallback = () => buildContextualChatReply(username, message, context, history);

  if (!isGeminiConfigured()) {
    return smartFallback();
  }

  const profileContext = buildProfileContext(username, context);
  const recentHistory = history.slice(-10);

  const historyBlock = recentHistory.length
    ? `\n\nRECENT CONVERSATION:\n${recentHistory.map((h) => `${h.role === "assistant" ? "Coach" : "Developer"}: ${h.message}`).join("\n")}`
    : "";

  const userMessage = `[Profile context — reference as needed, do not repeat verbatim]
${profileContext}
${historyBlock}

---
Developer's NEW message (answer THIS specifically, do not repeat earlier answers):
"${message}"`;

  try {
    const reply = await generateText({
      systemInstruction: CHAT_SYSTEM_PROMPT,
      userMessage,
      history: [],
      maxTokens: 2048,
      temperature: 0.85,
    });

    if (reply && reply.length > 10) return reply;
    throw new Error("Empty Gemini chat response");
  } catch (err) {
    console.warn("Gemini chat fallback:", err.response?.data?.error?.message || err.message);
    return smartFallback();
  }
}

module.exports = { generateCareerInsights, generateRoadmaps, generateChatResponse, buildFallbackInsights };
