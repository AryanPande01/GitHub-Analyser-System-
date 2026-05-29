function computeActivityAnalytics(repos, profile) {
  const now = Date.now();
  const pushDates = repos
    .map((r) => new Date(r.pushed_at).getTime())
    .filter((t) => !Number.isNaN(t));

  const recent30 = pushDates.filter((t) => now - t < 30 * 24 * 60 * 60 * 1000).length;
  const recent90 = pushDates.filter((t) => now - t < 90 * 24 * 60 * 60 * 1000).length;
  const recent180 = pushDates.filter((t) => now - t < 180 * 24 * 60 * 60 * 1000).length;

  const totalRepos = repos.length || 1;
  const activeRatio = recent90 / totalRepos;

  const contributionConsistency = Math.min(
    100,
    Math.round(activeRatio * 70 + (recent30 / totalRepos) * 30)
  );

  const commitFrequencyScore = Math.min(
    100,
    Math.round((recent30 * 15 + recent90 * 8 + recent180 * 3) / Math.max(totalRepos, 1))
  );

  let activityTrend = "stable";
  if (recent30 >= recent90 * 0.5 && recent30 > 2) activityTrend = "increasing";
  else if (recent90 < totalRepos * 0.2) activityTrend = "declining";

  const originalGrowth = profile.original_repos || 0;
  let repositoryGrowthTrend = "stable";
  if (originalGrowth >= 10 && recent90 >= 3) repositoryGrowthTrend = "growing";
  else if (recent180 < 2 && originalGrowth > 5) repositoryGrowthTrend = "slowing";

  const productivityScore = Math.round(
    contributionConsistency * 0.35 +
      commitFrequencyScore * 0.35 +
      Math.min((profile.recently_active_repos || 0) * 8, 30)
  );

  return {
    contribution_consistency: contributionConsistency,
    commit_frequency_score: commitFrequencyScore,
    activity_trend: activityTrend,
    repository_growth_trend: repositoryGrowthTrend,
    productivity_score: Math.min(100, productivityScore),
    metrics: {
      repos_pushed_last_30d: recent30,
      repos_pushed_last_90d: recent90,
      repos_pushed_last_180d: recent180,
      total_repos: totalRepos,
      account_age_days: profile.account_age_days,
    },
  };
}

module.exports = { computeActivityAnalytics };
