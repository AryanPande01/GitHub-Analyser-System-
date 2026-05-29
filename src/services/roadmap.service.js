const ROLES = [
  "SDE Intern",
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "AI Engineer",
  "ML Engineer",
  "DevOps Engineer",
];

const ROLE_FOCUS = {
  "SDE Intern": { frontend: 0.3, backend: 0.35, database: 0.15, devops: 0.1, problem_solving: 0.1 },
  "Backend Developer": { backend: 0.45, database: 0.25, system_design: 0.2, devops: 0.1 },
  "Frontend Developer": { frontend: 0.5, backend: 0.15, problem_solving: 0.2, system_design: 0.15 },
  "Full Stack Developer": { frontend: 0.3, backend: 0.35, database: 0.2, devops: 0.15 },
  "AI Engineer": { ai_ml: 0.4, backend: 0.25, python: 0.2, problem_solving: 0.15 },
  "ML Engineer": { ai_ml: 0.45, backend: 0.2, database: 0.15, problem_solving: 0.2 },
  "DevOps Engineer": { devops: 0.4, cloud: 0.25, backend: 0.2, system_design: 0.15 },
};

const DURATION_PHASES = {
  "1_month": [{ label: "Week 1-2", weeks: "1-2" }, { label: "Week 3-4", weeks: "3-4" }],
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

function generateRoadmap(targetRole, duration, skillAnalysis, readiness, weaknesses = []) {
  const phases = DURATION_PHASES[duration] || DURATION_PHASES["3_month"];
  const focus = ROLE_FOCUS[targetRole] || ROLE_FOCUS["Full Stack Developer"];

  const gaps = [];
  for (const s of skillAnalysis) {
    const weight = focus[s.category] || 0;
    if (weight > 0 && s.score < 60) {
      gaps.push({ category: s.category, current: s.score, target: 75, skills: s.skills });
    }
  }

  const focusAreas = [
    `Target role: ${targetRole}`,
    ...gaps.slice(0, 4).map((g) => `Improve ${g.category} (current: ${g.current}%)`),
    ...(weaknesses.slice(0, 2).map((w) => `Address: ${typeof w === "string" ? w : w.title || w}`)),
  ];

  const roadmapPhases = phases.map((phase, i) => {
    const gap = gaps[i % Math.max(gaps.length, 1)];
    return {
      ...phase,
      goals: [
        gap ? `Build a ${gap.category} project demonstrating ${(gap.skills || []).slice(0, 2).join(", ") || "core skills"}` : "Contribute to an open-source repository",
        i === 0 ? "Review fundamentals and set up learning schedule" : "Complete mock interviews for target role",
        "Document progress on GitHub with consistent commits",
      ],
      resources: [
        "Official documentation for primary stack",
        "System design primer (for mid-level roles)",
        "LeetCode / NeetCode for problem solving",
      ],
    };
  });

  return { phases: roadmapPhases, focus_areas: focusAreas };
}

function generateAllRoadmaps(targetRole, skillAnalysis, readiness, weaknesses) {
  const durations = ["1_month", "3_month", "6_month"];
  return durations.map((d) => ({
    duration: d,
    target_role: targetRole,
    ...generateRoadmap(targetRole, d, skillAnalysis, readiness, weaknesses),
  }));
}

module.exports = { ROLES, generateRoadmap, generateAllRoadmaps };
