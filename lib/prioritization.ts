export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function calculatePriorityScore(urgency: number, impact: number) {
  const u = clamp(urgency, 0, 10);
  const i = clamp(impact, 0, 10);

  // Geometric mean gives stronger weight when both urgency and impact are high.
  const score = Math.sqrt(u * i);
  return Number(score.toFixed(1));
}

export type ClusterSortMode =
  | "priority"
  | "urgency"
  | "impact"
  | "urgencyThenImpact"
  | "impactThenUrgency";

export function sortClusters<T extends { urgency: number; impact: number }>(
  clusters: T[],
  mode: ClusterSortMode = "urgencyThenImpact"
) {
  return [...clusters].sort((a, b) => {
    const compareNumber = (x: number, y: number) => y - x;

    const scoreA = calculatePriorityScore(a.urgency, a.impact);
    const scoreB = calculatePriorityScore(b.urgency, b.impact);

    switch (mode) {
      case "priority":
        return scoreB - scoreA;
      case "urgency":
        return compareNumber(a.urgency, b.urgency);
      case "impact":
        return compareNumber(a.impact, b.impact);
      case "urgencyThenImpact":
        if (b.urgency !== a.urgency) return b.urgency - a.urgency;
        if (b.impact !== a.impact) return b.impact - a.impact;
        return scoreB - scoreA;
      case "impactThenUrgency":
        if (b.impact !== a.impact) return b.impact - a.impact;
        if (b.urgency !== a.urgency) return b.urgency - a.urgency;
        return scoreB - scoreA;
      default:
        return scoreB - scoreA;
    }
  });
}

export function sortClustersByPriority<T extends { urgency: number; impact: number }>(clusters: T[]) {
  // Keep the previous behavior: urgency first, then impact, then priority score.
  return sortClusters(clusters, "urgencyThenImpact");
}
