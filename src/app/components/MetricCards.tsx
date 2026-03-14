"use client";

import React from "react";

type MetricCard = {
  label: string;
  value: string | number;
  description?: string;
};

type Props = {
  totalSignals: number;
  clusters: number;
  peakUrgency: number;
};

export function MetricCards({ totalSignals, clusters, peakUrgency }: Props) {
  const cards: MetricCard[] = [
    { label: "Total Signals", value: totalSignals },
    { label: "Clusters Found", value: clusters },
    { label: "Peak Urgency", value: peakUrgency.toFixed(1) },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-border-main bg-black/30 p-5">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">{card.label}</div>
          <div className="mt-2 text-3xl font-semibold text-text-primary">{card.value}</div>
          {card.description ? <div className="mt-1 text-xs text-text-muted">{card.description}</div> : null}
        </div>
      ))}
    </div>
  );
}
