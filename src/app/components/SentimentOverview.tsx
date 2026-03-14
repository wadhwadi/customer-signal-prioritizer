"use client";

import React from "react";

type Props = {
  sentimentBreakdown: Record<string, number>;
  topPraise: string;
  topComplaint: string;
};

export function SentimentOverview({ sentimentBreakdown, topPraise, topComplaint }: Props) {
  const positive = sentimentBreakdown.positive ?? 0;
  const negative = sentimentBreakdown.negative ?? 0;
  const request = sentimentBreakdown.request ?? 0;

  const total = positive + negative + request;

  const formatPercent = (value: number) => `${Math.round(value)}%`;

  return (
    <div className="rounded-2xl border border-border-main bg-black/30 p-6">
      <h2 className="text-lg font-semibold text-text-primary">Sentiment overview</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border-main bg-black/40 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Positive</div>
          <div className="mt-2 text-3xl font-semibold text-emerald-300">{formatPercent((positive / Math.max(total, 1)) * 100)}</div>
          <div className="text-xs text-text-muted">{positive} signals</div>
        </div>
        <div className="rounded-xl border border-border-main bg-black/40 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Negative</div>
          <div className="mt-2 text-3xl font-semibold text-rose-300">{formatPercent((negative / Math.max(total, 1)) * 100)}</div>
          <div className="text-xs text-text-muted">{negative} signals</div>
        </div>
        <div className="rounded-xl border border-border-main bg-black/40 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Feature requests</div>
          <div className="mt-2 text-3xl font-semibold text-sky-300">{formatPercent((request / Math.max(total, 1)) * 100)}</div>
          <div className="text-xs text-text-muted">{request} signals</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border-main bg-black/40 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Top praise</div>
          <div className="mt-2 text-sm text-text-primary">{topPraise || "N/A"}</div>
        </div>
        <div className="rounded-xl border border-border-main bg-black/40 p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-text-muted">Top complaint</div>
          <div className="mt-2 text-sm text-text-primary">{topComplaint || "N/A"}</div>
        </div>
      </div>
    </div>
  );
}
