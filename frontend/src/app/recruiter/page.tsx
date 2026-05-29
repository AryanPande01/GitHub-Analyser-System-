"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Award, Star, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressBar, StatCard } from "@/components/ui/stat-card";
import { getRecruiterDashboard, type RecruiterCandidate } from "@/lib/api";

function recommendationVariant(rec: string): "success" | "info" | "warning" | "muted" {
  if (rec.includes("Exceptional") || rec.includes("Strong Hire")) return "success";
  if (rec.includes("Interview")) return "info";
  if (rec.includes("Consider")) return "warning";
  return "muted";
}

export default function RecruiterPage() {
  const [candidates, setCandidates] = useState<RecruiterCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getRecruiterDashboard()
      .then((res) => setCandidates(res.candidates || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Recruiter Dashboard"
        description="Rank and evaluate candidates by readiness, repository quality, influence, and hiring fit."
      />

      {!loading && candidates.length > 0 && (
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Candidates" value={candidates.length} icon={Award} />
          <StatCard
            label="Top Readiness"
            value={`${Math.round(candidates[0]?.scores.overall_readiness || 0)}`}
            sub={`@${candidates[0]?.username}`}
            icon={TrendingUp}
          />
          <StatCard
            label="Top Influence"
            value={`${Math.round([...candidates].sort((a, b) => (b.scores.influence || 0) - (a.scores.influence || 0))[0]?.scores.influence || 0)}`}
            sub="Impact score"
            icon={Star}
          />
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
      )}

      {!loading && candidates.length === 0 && (
        <Card className="py-12 text-center">
          <p className="text-[var(--text-muted)]">No analyzed candidates yet.</p>
          <Link href="/analyze" className="mt-3 inline-block text-sm text-[var(--accent)] hover:underline">
            Analyze profiles to populate →
          </Link>
        </Card>
      )}

      <div className="space-y-4">
        {candidates.map((c) => (
          <Card key={c.username} className="group transition hover:border-[var(--accent)]/30">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
              <div className="flex items-center gap-4 lg:w-72">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bg-hover)] text-lg font-bold text-[var(--text-dim)]">
                  #{c.rank}
                </div>
                {c.avatar_url && (
                  <Image src={c.avatar_url} alt={c.username} width={52} height={52} className="rounded-xl ring-1 ring-[var(--border)]" />
                )}
                <div className="min-w-0">
                  <Link href={`/profile/${c.username}`} className="font-semibold hover:text-[var(--accent)]">
                    @{c.username}
                  </Link>
                  <p className="truncate text-xs text-[var(--text-dim)]">{c.technical_summary}</p>
                  {c.orientation && <Badge variant="muted" className="mt-1">{c.orientation}</Badge>}
                </div>
              </div>

              <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Readiness</p>
                  <p className="text-xl font-bold tabular-nums">{Math.round(c.scores.overall_readiness)}</p>
                  <ProgressBar value={c.scores.overall_readiness} className="mt-2" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Influence</p>
                  <p className="text-xl font-bold tabular-nums">{Math.round(c.scores.influence || 0)}</p>
                  <ProgressBar value={c.scores.influence || 0} className="mt-2" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Stars</p>
                  <p className="text-xl font-bold tabular-nums">{c.stats.total_stars.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--text-dim)]">Repo Quality</p>
                  <p className="text-xl font-bold tabular-nums">{c.scores.repository_quality}</p>
                </div>
              </div>

              <div className="lg:w-56 lg:text-right">
                <Badge variant={recommendationVariant(c.hiring_recommendation)} className="whitespace-normal text-left lg:text-right">
                  {c.hiring_recommendation}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
