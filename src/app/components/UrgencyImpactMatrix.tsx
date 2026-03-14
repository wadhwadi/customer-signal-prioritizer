"use client";

import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Cluster } from "../../../lib/types";

type Props = {
  clusters: Cluster[];
};

function BubbleShape(props: any) {
  const { cx, cy, payload } = props;
  const r = typeof payload?.r === "number" ? payload.r : 8;
  return <circle cx={cx} cy={cy} r={r} fill="#22d3ee" fillOpacity={0.75} stroke="#22d3ee" strokeWidth={1} />;
}

export function UrgencyImpactMatrix({ clusters }: Props) {
  const data = useMemo(
    () =>
      clusters.map((cluster) => ({
        x: cluster.impact,
        y: cluster.urgency,
        r: Math.max(6, Math.min(28, cluster.signals.length * 5)),
        name: cluster.theme,
        signals: cluster.signals.length,
      })),
    [clusters]
  );

  const tooltipFormatter = (value: unknown, name?: string | number) => {
    const num = typeof value === "number" ? value : Array.isArray(value) ? Number(value[0]) : Number(value);
    if (name === "x") return [`Impact: ${num.toFixed(1)}`, "Impact"];
    if (name === "y") return [`Urgency: ${num.toFixed(1)}`, "Urgency"];
    return [`${value}`, `${name ?? ""}`];
  };

  return (
    <div className="rounded-2xl border border-border-main bg-black/30 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Urgency × Impact matrix</h2>
        <span className="text-sm text-text-muted">Bubble size = # of signals</span>
      </div>
      <div className="mt-6 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <CartesianGrid stroke="#1e2532" />
            <XAxis
              type="number"
              dataKey="x"
              name="Impact"
              domain={[0, 10]}
              tick={{ fill: "#cbd5e1" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Urgency"
              domain={[0, 10]}
              tick={{ fill: "#cbd5e1" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ stroke: "#1e2532", strokeWidth: 1 }}
              contentStyle={{ background: "#0b0e14", border: "1px solid #1e2532" }}
              formatter={tooltipFormatter}
              labelFormatter={(label) => `Cluster: ${label ?? ""}`}
            />
            <Scatter
              data={data}
              shape={<BubbleShape />}
              name="Clusters"
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
