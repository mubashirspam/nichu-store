"use client";

import React from "react";

export default function NutritionPreview({ dark }: { dark: boolean }) {
  const bg = dark ? "#1a1a2e" : "#f8fafc";
  const txt = dark ? "#94a3b8" : "#334155";
  const grid = dark ? "#1e1e3a" : "#e2e8f0";
  const bars = [
    { label: "Mon", a: 80, b: 55, c: 35 }, { label: "Tue", a: 70, b: 65, c: 30 },
    { label: "Wed", a: 90, b: 50, c: 40 }, { label: "Thu", a: 75, b: 60, c: 25 },
    { label: "Fri", a: 85, b: 45, c: 35 }, { label: "Sat", a: 65, b: 70, c: 45 },
    { label: "Sun", a: 60, b: 55, c: 30 },
  ];
  return (
    <svg viewBox="0 0 400 260" className="w-full rounded-xl">
      <rect width="400" height="260" fill={bg} rx="12" />
      <text x="20" y="28" fill={txt} fontSize="13" fontWeight="bold">Analytics — This Week</text>
      {bars.map((b, i) => {
        const x = 45 + i * 50;
        return (
          <g key={b.label}>
            <rect x={x} y={210 - b.a} width="12" height={b.a} fill="#8b5cf6" rx="2" />
            <rect x={x + 14} y={210 - b.b} width="12" height={b.b} fill="#3b82f6" rx="2" />
            <rect x={x + 28} y={210 - b.c} width="12" height={b.c} fill="#f59e0b" rx="2" />
            <text x={x + 14} y="228" fill={dark ? "#475569" : "#94a3b8"} fontSize="9" textAnchor="middle">{b.label}</text>
          </g>
        );
      })}
      <line x1="40" y1="210" x2="390" y2="210" stroke={grid} strokeWidth="1" />
      <rect x="120" y="240" width="10" height="10" fill="#8b5cf6" rx="2" />
      <text x="134" y="249" fill={dark ? "#475569" : "#64748b"} fontSize="9">Series A</text>
      <rect x="185" y="240" width="10" height="10" fill="#3b82f6" rx="2" />
      <text x="199" y="249" fill={dark ? "#475569" : "#64748b"} fontSize="9">Series B</text>
      <rect x="250" y="240" width="10" height="10" fill="#f59e0b" rx="2" />
      <text x="264" y="249" fill={dark ? "#475569" : "#64748b"} fontSize="9">Series C</text>
    </svg>
  );
}
