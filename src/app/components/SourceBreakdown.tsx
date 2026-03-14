"use client";

import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Props = {
  sourceSummary: Record<string, number>;
};

const COLORS = ["#22D3EE", "#38BDF8", "#60A5FA", "#7C3AED", "#F97316", "#F43F5E"];

export function SourceBreakdown({ sourceSummary }: Props) {
  const data = Object.entries(sourceSummary).map(([source, value]) => ({ name: source, value }));

  return (
    <div className="rounded-2xl border border-border-main bg-black/30 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Source breakdown</h2>
        <span className="text-sm text-text-muted">Where signals came from</span>
      </div>
      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={96} paddingAngle={3}>
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "#0b0e14", border: "1px solid #1e2532" }}
              itemStyle={{ color: "#e2e8f0" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
