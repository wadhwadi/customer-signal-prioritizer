"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

type Props = {
  capabilityScores: Record<string, number>;
};

export function CapabilityMap({ capabilityScores }: Props) {
  const data = Object.entries(capabilityScores).map(([capability, score]) => ({
    capability,
    score,
  }));

  return (
    <div className="rounded-2xl border border-border-main bg-black/30 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Capability map</h2>
        <span className="text-sm text-text-muted">Higher = bigger opportunity</span>
      </div>
      <div className="mt-6 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
            <CartesianGrid stroke="#1e2532" vertical={false} />
            <XAxis type="number" tick={{ fill: "#cbd5e1" }} axisLine={false} tickLine={false} />
            <YAxis
              dataKey="capability"
              type="category"
              width={180}
              tick={{ fill: "#cbd5e1", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ background: "#0b0e14", border: "1px solid #1e2532" }}
              labelStyle={{ color: "#e2e8f0" }}
              formatter={(value: unknown) => {
                const num = Array.isArray(value) ? Number(value[0]) : Number(value);
                return `${Number.isFinite(num) ? num.toFixed(1) : 0}`;
              }}
            />
            <Bar dataKey="score" fill="#22d3ee" radius={[6, 0, 0, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
