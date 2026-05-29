"use client";

import { useState } from "react";
import { GitCompare, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ReadinessChart } from "@/components/charts/readiness-chart";
import { compareProfiles, type CompareReport } from "@/lib/api";

export default function ComparePage() {
  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [report, setReport] = useState<CompareReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCompare(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await compareProfiles([user1.trim(), user2.trim()].filter(Boolean));
      setReport(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Compare Developers" description="Side-by-side analysis of skills, stars, activity, and readiness scores." />

      <Card className="mb-8">
        <form onSubmit={handleCompare} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-dim)]">Developer 1</label>
            <Input placeholder="username" value={user1} onChange={(e) => setUser1(e.target.value)} required />
          </div>
          <div className="flex items-center justify-center pb-2 text-[var(--text-dim)]">
            <GitCompare className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-medium uppercase tracking-wider text-[var(--text-dim)]">Developer 2</label>
            <Input placeholder="username" value={user2} onChange={(e) => setUser2(e.target.value)} required />
          </div>
          <Button type="submit" disabled={loading} size="lg">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Compare"}
          </Button>
        </form>
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </Card>

      {report && (
        <>
          <Card className="mb-6">
            <CardTitle>Comparison Summary</CardTitle>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                { label: "Most Stars", value: report.summary.highest_stars },
                { label: "Highest Readiness", value: report.summary.highest_readiness },
                { label: "Most Active", value: report.summary.highest_activity },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg border bg-[var(--bg-elevated)] p-4 text-center">
                  <p className="text-xs text-[var(--text-dim)]">{label}</p>
                  <Badge variant="success" className="mt-2">@{value}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            {report.developers.map((dev) => (
              <Card key={dev.username}>
                <div className="mb-4 flex items-center justify-between">
                  <CardTitle>@{dev.username}</CardTitle>
                  <Badge variant="info">{dev.overall_readiness} readiness</Badge>
                </div>
                <div className="mb-4 grid grid-cols-3 gap-3 text-center text-sm">
                  <div><p className="text-[var(--text-dim)]">Stars</p><p className="font-bold">{dev.total_stars.toLocaleString()}</p></div>
                  <div><p className="text-[var(--text-dim)]">Activity</p><p className="font-bold">{dev.productivity}%</p></div>
                  <div><p className="text-[var(--text-dim)]">Readiness</p><p className="font-bold">{dev.overall_readiness}</p></div>
                </div>
                <ReadinessChart
                  data={Object.entries(dev.readiness_breakdown || {}).map(([name, score]) => ({
                    name: name.replace("_", " "),
                    score: Number(score),
                  }))}
                />
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
