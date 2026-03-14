import { calculatePriorityScore, sortClustersByPriority } from "../lib/prioritization";

describe("prioritization", () => {
  it("calculates a geometric mean based priority score", () => {
    expect(calculatePriorityScore(10, 10)).toBe(10);
    expect(calculatePriorityScore(8, 8)).toBeCloseTo(8);
    expect(calculatePriorityScore(10, 0)).toBe(0);
  });

  it("sorts clusters primarily by urgency then impact", () => {
    const clusters = [
      { urgency: 5, impact: 5 },
      { urgency: 10, impact: 1 },
      { urgency: 1, impact: 10 },
      { urgency: 9, impact: 9 },
    ];

    const sorted = sortClustersByPriority(clusters);
    expect(sorted[0].urgency).toBe(10);
    expect(sorted[1].urgency).toBe(9);
    expect(sorted[2].urgency).toBe(5);
    expect(sorted[3].urgency).toBe(1);
  });
});
