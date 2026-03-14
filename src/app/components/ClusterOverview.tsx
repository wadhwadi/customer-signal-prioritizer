"use client";

import React, { useMemo, useState } from "react";
import type { Cluster, Signal } from "../../../lib/types";
import { calculatePriorityScore, ClusterSortMode, sortClusters } from "../../../lib/prioritization";

type Props = {
  clusters: Cluster[];
  signals: Signal[];
};

function urgencyColor(urgency: number) {
  if (urgency >= 8) return "text-rose-300";
  if (urgency >= 6) return "text-amber-300";
  return "text-emerald-300";
}

export function ClusterOverview({ clusters, signals }: Props) {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<ClusterSortMode>("urgencyThenImpact");
  const [minUrgency, setMinUrgency] = useState(0);
  const [minImpact, setMinImpact] = useState(0);

  const safeClusters = useMemo(() => clusters ?? [], [clusters]);
  const safeSignals = useMemo(() => signals ?? [], [signals]);

  const prioritized = useMemo(() => {
    const filtered = safeClusters.filter((c) => c.urgency >= minUrgency && c.impact >= minImpact);
    return sortClusters(filtered, sortMode);
  }, [safeClusters, minImpact, minUrgency, sortMode]);

  const activeSignals = useMemo(() => {
    const indexMap = new Map(safeSignals.map((signal, idx) => [idx + 1, signal]));
    return indexMap;
  }, [safeSignals]);

  const toggleCluster = (theme: string) => {
    setExpandedCluster((prev) => (prev === theme ? null : theme));
  };

  return (
    <div className="rounded-2xl border border-border-main bg-black/30 p-6">
      <h2 className="text-lg font-semibold text-text-primary">Cluster overview</h2>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-text-muted">Sort clusters by</label>
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as ClusterSortMode)}
            className="rounded-lg border border-border-main bg-black/60 px-3 py-2 text-sm text-text-primary"
          >
            <option value="urgencyThenImpact">Urgency → Impact</option>
            <option value="impactThenUrgency">Impact → Urgency</option>
            <option value="urgency">Urgency</option>
            <option value="impact">Impact</option>
            <option value="priority">Calculated priority</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-muted">Min urgency</label>
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={minUrgency}
              onChange={(e) => setMinUrgency(Number(e.target.value))}
              className="w-24 rounded-lg border border-border-main bg-black/60 px-3 py-2 text-sm text-text-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-text-muted">Min impact</label>
            <input
              type="number"
              min={0}
              max={10}
              step={0.1}
              value={minImpact}
              onChange={(e) => setMinImpact(Number(e.target.value))}
              className="w-24 rounded-lg border border-border-main bg-black/60 px-3 py-2 text-sm text-text-primary"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {prioritized.map((cluster) => {
          const score = calculatePriorityScore(cluster.urgency, cluster.impact);
          const isExpanded = expandedCluster === cluster.theme;
          const signalItems = (cluster.signals ?? [])
            .map((signalIndex) => activeSignals.get(signalIndex))
            .filter(Boolean);

          return (
            <div key={cluster.theme} className="rounded-xl border border-border-main bg-black/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-text-primary">{cluster.theme}</div>
                  <div className="mt-1 text-xs text-text-muted">{cluster.summary}</div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCluster(cluster.theme)}
                    className="rounded-full border border-border-main bg-black/60 px-3 py-1 text-xs font-semibold text-text-primary hover:bg-black/70"
                  >
                    {isExpanded ? "Hide details" : "Show details"}
                  </button>
                  <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-text-muted">
                    {cluster.signals.length} signals
                  </span>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${urgencyColor(cluster.urgency)}`}>
                    Urgency: {cluster.urgency.toFixed(1)}
                  </span>
                  <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-text-muted">
                    Priority: {score.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-text-muted">
                  Capability: {cluster.capability}
                </span>
                <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-text-muted">
                  Sentiment: {cluster.sentiment}
                </span>
              </div>
              {isExpanded ? (
                <div className="mt-3 rounded-xl border border-border-main bg-black/20 p-4">
                  <div className="text-xs font-semibold text-text-muted">Sample signals (from the dataset)</div>
                  <ul className="mt-2 space-y-2 text-sm text-text-primary">
                    {signalItems.length ? (
                      signalItems.map((signal) => (
                        <li key={signal.id} className="rounded-lg bg-black/30 p-3">
                          <div className="font-semibold">{signal.source}</div>
                          <div className="mt-1 text-xs text-text-muted">{signal.date}</div>
                          <div className="mt-2">{signal.text}</div>
                        </li>
                      ))
                    ) : (
                      <li className="text-xs text-text-muted">No signal details available.</li>
                    )}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
