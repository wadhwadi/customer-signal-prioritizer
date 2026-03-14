import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClusterOverview } from "../src/app/components/ClusterOverview";
import type { Cluster, Signal } from "../lib/types";

describe("ClusterOverview", () => {
  const clusters: Cluster[] = [
    {
      theme: "Fast onboarding",
      summary: "Users want a faster first-run experience.",
      signals: [1],
      urgency: 9,
      impact: 8,
      capability: "Developer Experience & SDKs",
      sentiment: "mostly_negative",
    },
    {
      theme: "API reliability",
      summary: "Occasional 500s and timeouts are hurting adoption.",
      signals: [2],
      urgency: 8,
      impact: 9,
      capability: "API Reliability & Infrastructure",
      sentiment: "mostly_negative",
    },
  ];

  const signals: Signal[] = [
    { id: "1", text: "It takes too long to get started.", source: "Reddit", sourceUrl: "", sentiment: "negative", date: "2026-02" },
    { id: "2", text: "API errors are blocking our pipeline.", source: "Twitter", sourceUrl: "", sentiment: "negative", date: "2026-02" },
  ];

  it("renders cluster themes and toggles details", () => {
    render(<ClusterOverview clusters={clusters} signals={signals} />);

    expect(screen.getByText("Fast onboarding")).toBeInTheDocument();
    expect(screen.getByText("API reliability")).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /Show details/i })[0]);

    expect(screen.getByText(/It takes too long to get started/i)).toBeInTheDocument();
  });
});
