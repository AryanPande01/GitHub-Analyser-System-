"use client";

import { useState } from "react";
import { BookOpen, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getFullAnalysis } from "@/lib/api";

type RoadmapItem = {
  target_role: string;
  duration: string;
  focus_areas: string[];
  phases: { label: string; goals: string[]; resources?: string[] }[];
};

export default function RoadmapPage() {
  const [username, setUsername] = useState("");
  const [roadmaps, setRoadmaps] = useState<RoadmapItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadRoadmap(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await getFullAnalysis(username.trim());
      const items = (res.data.roadmaps || []) as RoadmapItem[];
      if (!items.length) {
        setError("No roadmap found. Run analysis on the Analyze page first, then return here.");
      }
      setRoadmaps(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load roadmap");
    } finally {
      setLoading(false);
    }
  }

  const durationLabel: Record<string, string> = {
    "1_month": "1 Month",
    "3_month": "3 Months",
    "6_month": "6 Months",
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Learning Roadmap" description="Personalized 1, 3, and 6-month plans based on your skill gaps and target role." />

      <Card className="mb-8">
        <form onSubmit={loadRoadmap} className="flex gap-3">
          <Input placeholder="GitHub username" value={username} onChange={(e) => setUsername(e.target.value)} required className="flex-1" />
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load Roadmap"}
          </Button>
        </form>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </Card>

      {roadmaps.map((rm) => (
        <Card key={rm.duration} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-[var(--accent-glow)] p-2 text-[var(--accent)]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>{rm.target_role}</CardTitle>
              <CardDescription>{durationLabel[rm.duration] || rm.duration} plan</CardDescription>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-dim)]">Focus Areas</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {rm.focus_areas.map((f, i) => (
                <Badge key={i} variant="muted">{f}</Badge>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {rm.phases.map((phase, i) => (
              <div key={i} className="rounded-lg border bg-[var(--bg-elevated)] p-4">
                <p className="font-medium">{phase.label}</p>
                <ul className="mt-3 space-y-2">
                  {phase.goals?.map((g, j) => (
                    <li key={j} className="flex gap-2 text-sm text-[var(--text-muted)]">
                      <span className="text-[var(--accent)]">→</span> {g}
                    </li>
                  ))}
                </ul>
                {phase.resources && phase.resources.length > 0 && (
                  <div className="mt-3 border-t border-[var(--border)] pt-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-dim)]">Resources</p>
                    <ul className="mt-2 space-y-1">
                      {phase.resources.map((resource, k) => (
                        <li key={k} className="text-sm text-[var(--text-muted)]">• {resource}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
