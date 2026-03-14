"use client";

import React, { useMemo, useState } from "react";
import type { AnalysisResult, ResearchResult, Signal } from "../../../lib/types";
import { sortClustersByPriority } from "../../../lib/prioritization";
import { SentimentOverview } from "./SentimentOverview";
import { MetricCards } from "./MetricCards";
import { CapabilityMap } from "./CapabilityMap";
import { SourceBreakdown } from "./SourceBreakdown";
import { ClusterOverview } from "./ClusterOverview";
import { GTMInsights } from "./GTMInsights";
import { UrgencyImpactMatrix } from "./UrgencyImpactMatrix";
import { ExportReport } from "./ExportReport";

type Props = {
  product: string;
  research: ResearchResult;
  analysis: AnalysisResult;
};

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "clusters", label: "Clusters" },
  { id: "matrix", label: "Matrix" },
  { id: "export", label: "Export" },
];

export function Dashboard({ product, research, analysis }: Props) {
  const [activeTab, setActiveTab] = useState("dashboard");

  const peakUrgency = useMemo(() => {
    return Math.max(...analysis.clusters.map((c) => c.urgency), 0);
  }, [analysis]);

  const capabilityScores = useMemo(() => {
    const scores: Record<string, number> = {};
    analysis.clusters.forEach((c) => {
      const key = c.capability || "Other";
      scores[key] = Math.max(scores[key] ?? 0, c.impact);
    });
    return scores;
  }, [analysis]);

  const prioritizedClusters = useMemo(() => sortClustersByPriority(analysis.clusters), [analysis]);
  const topPriorities = prioritizedClusters.slice(0, 3);

  const signalsFound = research.signalsFound ?? research.signals.length;

  return (
    <div className="w-full max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-primary">Analysis</h1>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? "bg-cyan-400 text-black shadow-[0_0_12px_rgba(34,211,238,0.4)]"
                  : "border border-border-main bg-black/30 text-text-muted hover:border-cyan-400/40 hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {activeTab === "dashboard" ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border-main bg-black/30 p-6">
              <h2 className="text-lg font-semibold text-text-primary">Top priorities</h2>
              <p className="mt-1 text-sm text-text-muted">Highest priority clusters to tackle first.</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {topPriorities.map((cluster) => (
                  <div key={cluster.theme} className="rounded-xl border border-border-main bg-black/40 p-4">
                    <div className="text-sm font-semibold text-text-primary">{cluster.theme}</div>
                    <div className="mt-1 text-xs text-text-muted">{cluster.summary}</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-text-muted">
                        Urgency: {cluster.urgency.toFixed(1)}
                      </span>
                      <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-text-muted">
                        Impact: {cluster.impact.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <SentimentOverview
              sentimentBreakdown={analysis.sentimentBreakdown}
              topPraise={analysis.topPraise}
              topComplaint={analysis.topComplaint}
            />

            <MetricCards
              totalSignals={signalsFound}
              clusters={analysis.clusters.length}
              peakUrgency={peakUrgency}
            />

            <GTMInsights insights={analysis.gtmInsights} />

            <div className="grid gap-6 lg:grid-cols-2">
              <CapabilityMap capabilityScores={capabilityScores} />
              <SourceBreakdown sourceSummary={research.sourceSummary} />
            </div>

            <ClusterOverview clusters={analysis.clusters} signals={research.signals} />
          </div>
        ) : activeTab === "clusters" ? (
          <ClusterOverview clusters={analysis.clusters} signals={research.signals} />
        ) : activeTab === "matrix" ? (
          <UrgencyImpactMatrix clusters={analysis.clusters} />
        ) : (
          <ExportReport product={product} research={research} analysis={analysis} />
        )}
      </div>
    </div>
  );
}
