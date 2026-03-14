"use client";

import React from "react";
import type { GTMInsight } from "../../../lib/types";

type Props = {
  insights: GTMInsight[];
};

export function GTMInsights({ insights }: Props) {
  if (!insights || insights.length === 0) {
    return (
      <div className="rounded-2xl border border-border-main bg-black/30 p-6">
        <h2 className="text-lg font-semibold text-text-primary">GTM insights</h2>
        <div className="mt-4 text-sm text-text-muted">No insights available yet.</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-main bg-black/30 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">GTM insights</h2>
        <span className="text-sm text-text-muted">Actionable recommendations</span>
      </div>
      <div className="mt-4 space-y-4">
        {insights.map((insight, idx) => (
          <div key={`${insight.type}-${idx}`} className="rounded-xl border border-border-main bg-black/40 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="text-sm text-text-primary">{insight.insight}</div>
              <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-text-muted">
                {insight.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
