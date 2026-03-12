"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface ScoreBreakdownChartProps {
  codeContributions: number;
  blockchainActivity: number;
  agentInteractions: number;
  uptime: number;
}

export function ScoreBreakdownChart({
  codeContributions,
  blockchainActivity,
  agentInteractions,
  uptime,
}: ScoreBreakdownChartProps) {
  const data = [
    { category: "Code", value: codeContributions },
    { category: "Blockchain", value: blockchainActivity },
    { category: "Interactions", value: agentInteractions },
    { category: "Uptime", value: uptime },
  ];

  return (
    <ResponsiveContainer width="100%" height={200} className="sm:!h-[250px]">
      <RadarChart data={data}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fill: "#475569", fontSize: 11 }}
        />
        <Radar
          dataKey="value"
          stroke="#4f46e5"
          fill="url(#radarGradient)"
          fillOpacity={0.25}
          strokeWidth={2}
        />
        <defs>
          <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </RadarChart>
    </ResponsiveContainer>
  );
}
