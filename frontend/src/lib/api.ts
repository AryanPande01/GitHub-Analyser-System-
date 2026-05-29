const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    cache: "no-store",
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || `Request failed: ${res.status}`);
  }
  return json;
}

export async function analyzeProfile(username: string) {
  return request<{ success: boolean; data: Record<string, unknown> }>(
    `/api/profiles/analyze/${username}`,
    { method: "POST" }
  );
}

export async function getFullAnalysis(username: string) {
  return request<{ success: boolean; data: AnalysisData }>(`/api/analysis/${username}/full`);
}

export async function compareProfiles(usernames: string[]) {
  return request<{ success: boolean; data: CompareReport }>("/api/compare", {
    method: "POST",
    body: JSON.stringify({ usernames }),
  });
}

export async function sendChat(username: string, message: string) {
  return request<{ success: boolean; data: { reply: string } }>("/api/chat", {
    method: "POST",
    body: JSON.stringify({ username, message }),
  });
}

export async function getChatHistory(username: string) {
  return request<{ success: boolean; data: { role: string; message: string }[] }>(
    `/api/analysis/${username}/chat`
  );
}

export async function getRecruiterDashboard(page = 1) {
  return request<{ success: boolean; candidates: RecruiterCandidate[]; total: number }>(
    `/api/recruiter?page=${page}&limit=20`
  );
}

export interface AnalysisData {
  profile: Record<string, unknown>;
  skills: { category: string; skills: string[]; score: number }[];
  repositories: {
    repo_name: string;
    domain: string;
    quality_score: number;
    stars: number;
    language: string | null;
  }[];
  readiness: {
    frontend_score: number;
    backend_score: number;
    database_score: number;
    devops_score: number;
    system_design_score: number;
    problem_solving_score: number;
    overall_score: number;
    explanations: Record<string, string>;
  } | null;
  insights: {
    strengths: string[];
    weaknesses: string[];
    missing_skills: string[];
    career_paths: string[];
    resume_suggestions: string[];
    portfolio_suggestions: string[];
    interview_suggestions: string[];
  } | null;
  roadmaps: { target_role: string; duration: string; phases: unknown[]; focus_areas: string[] }[];
  activity: {
    contribution_consistency: number;
    commit_frequency_score: number;
    activity_trend: string;
    productivity_score: number;
  } | null;
}

export interface CompareReport {
  developers: {
    username: string;
    total_stars: number;
    overall_readiness: number;
    productivity: number;
    readiness_breakdown: Record<string, number>;
  }[];
  summary: Record<string, string>;
}

export interface RecruiterCandidate {
  rank: number;
  username: string;
  avatar_url: string;
  scores: Record<string, number> & {
    overall_readiness: number;
    influence?: number;
    repository_quality: number;
  };
  stats: { followers: number; total_stars: number; public_repos: number };
  orientation?: string;
  hiring_recommendation: string;
  technical_summary: string;
}
