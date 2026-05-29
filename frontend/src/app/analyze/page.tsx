"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Code2, Loader2, Sparkles, TrendingUp, Zap } from "lucide-react";
import { PageHeader } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { analyzeProfile } from "@/lib/api";

export default function AnalyzePage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setError("");
    try {
      await analyzeProfile(username.trim());
      router.push(`/profile/${username.trim().toLowerCase()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Analyze GitHub Profile"
        description="Deep-scan any public GitHub profile for skills, readiness scores, repository intelligence, and AI career insights."
      />

      <Card className="relative overflow-hidden border-[var(--accent)]/20">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-[var(--accent-glow)] blur-3xl" />
        <form onSubmit={handleSubmit} className="relative space-y-5">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code2 className="h-5 w-5 text-[var(--accent)]" />
              Enter GitHub Username
            </CardTitle>
            <CardDescription>We fetch repos, compute scores, and generate career intelligence.</CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Input
              placeholder="e.g. torvalds, octocat, your-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className="flex-1 text-base"
              aria-label="GitHub username"
            />
            <Button type="submit" disabled={loading} size="lg" className="sm:min-w-[160px]">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400" role="alert">
              {error}
            </div>
          )}
        </form>
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: Zap, title: "Skill Detection", desc: "Frontend, backend, DevOps, cloud & AI/ML from repo signals" },
          { icon: TrendingUp, title: "Readiness Scores", desc: "Interview readiness across 6 domains with explanations" },
          { icon: Sparkles, title: "AI Insights", desc: "Strengths, gaps, career paths & personalized roadmaps" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border bg-[var(--bg-card)] p-5 transition hover:border-[var(--border-subtle)]">
            <div className="mb-3 inline-flex rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
              <Icon className="h-4 w-4" />
            </div>
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
