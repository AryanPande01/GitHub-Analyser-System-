"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  GitFork,
  MapPin,
  Star,
  Users,
} from "lucide-react";
import { getFullAnalysis, type AnalysisData } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBar, ScoreRing, StatCard } from "@/components/ui/stat-card";
import { ReadinessChart } from "@/components/charts/readiness-chart";
import { SkillsChart } from "@/components/charts/skills-chart";

export default function ProfilePage() {
  const params = useParams();
  const username = String(params.username);
  const [data, setData] = useState<AnalysisData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFullAnalysis(username)
      .then((res) => setData(res.data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 sm:grid-cols-4">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}</div>
        <div className="grid gap-4 md:grid-cols-2"><Skeleton className="h-72" /><Skeleton className="h-72" /></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="text-center">
        <p className="text-red-400">{error || "Profile not found"}</p>
        <Link href="/analyze" className="mt-4 inline-block text-sm text-[var(--accent)] hover:underline">
          Analyze this profile first →
        </Link>
      </Card>
    );
  }

  const profile = data.profile as Record<string, string | number | boolean | null>;
  const readiness = data.readiness;
  const tier = (readiness as { influence_tier?: string })?.influence_tier;

  const readinessData = readiness
    ? [
        { name: "Frontend", score: readiness.frontend_score },
        { name: "Backend", score: readiness.backend_score },
        { name: "Database", score: readiness.database_score },
        { name: "DevOps", score: readiness.devops_score },
        { name: "System", score: readiness.system_design_score },
        { name: "DSA", score: readiness.problem_solving_score },
      ]
    : [];

  const skillsPie = (data.skills || []).map((s) => ({ name: s.category, value: Number(s.score) || 0 }));

  return (
    <div className="animate-fade-in space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-[var(--bg-card)] p-6 md:p-8">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[var(--accent-glow)] blur-3xl" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            {profile.avatar_url && (
              <Image
                src={String(profile.avatar_url)}
                alt={username}
                width={80}
                height={80}
                className="rounded-2xl ring-2 ring-[var(--border)]"
              />
            )}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold md:text-3xl">@{username}</h1>
                {tier && <Badge variant="success">{tier}</Badge>}
                {profile.hireable && <Badge variant="info">Open to work</Badge>}
              </div>
              <p className="mt-1 max-w-lg text-[var(--text-muted)]">{String(profile.bio || "No bio provided")}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-sm text-[var(--text-dim)]">
                {profile.location && (
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{String(profile.location)}</span>
                )}
                <a href={String(profile.github_url || "#")} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-[var(--accent)]">
                  GitHub <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
          {readiness && <ScoreRing score={readiness.overall_score} label="Readiness" />}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Stars" value={Number(profile.total_stars || 0).toLocaleString()} icon={Star} trend="up" />
        <StatCard label="Followers" value={Number(profile.followers || 0).toLocaleString()} icon={Users} />
        <StatCard label="Public Repos" value={Number(profile.public_repos || 0)} icon={GitFork} />
        <StatCard label="Productivity" value={`${data.activity?.productivity_score ?? 0}%`} sub={data.activity?.activity_trend} trend="up" />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardTitle>Interview Readiness</CardTitle>
          <ReadinessChart data={readinessData} />
        </Card>
        <Card>
          <CardTitle>Skill Categories</CardTitle>
          <SkillsChart data={skillsPie} />
          <div className="mt-4 flex flex-wrap gap-2">
            {(data.skills || []).map((s) => (
              <Badge key={s.category} variant="muted">{s.category}: {Math.round(s.score)}%</Badge>
            ))}
          </div>
        </Card>
      </div>

      {/* Insights */}
      {data.insights && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardTitle className="text-emerald-400">Strengths</CardTitle>
            <ul className="mt-4 space-y-3">
              {data.insights.strengths.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--text-muted)]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <CardTitle className="text-amber-400">Growth Areas</CardTitle>
            <ul className="mt-4 space-y-3">
              {data.insights.weaknesses.map((s, i) => (
                <li key={i} className="flex gap-3 text-sm text-[var(--text-muted)]">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {/* Repositories */}
      <Card>
        <CardTitle>Repository Intelligence</CardTitle>
        <div className="mt-4 space-y-3">
          {(data.repositories || []).slice(0, 8).map((repo) => (
            <div key={repo.repo_name} className="flex items-center gap-4 rounded-lg border bg-[var(--bg-elevated)] p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{repo.repo_name}</p>
                  <Badge variant="muted">{repo.domain}</Badge>
                </div>
                <p className="mt-0.5 text-xs text-[var(--text-dim)]">{repo.language || "Unknown"} · {repo.stars} stars</p>
              </div>
              <div className="w-32 shrink-0">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-[var(--text-dim)]">Quality</span>
                  <span className="font-medium">{Math.round(repo.quality_score)}</span>
                </div>
                <ProgressBar value={repo.quality_score} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Career paths */}
      {data.insights?.career_paths && (
        <Card>
          <CardTitle>Recommended Career Paths</CardTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {data.insights.career_paths.map((path, i) => (
              <Badge key={i} variant={i === 0 ? "success" : "default"}>{path}</Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
