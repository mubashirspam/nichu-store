"use client";

import React from "react";

export default function ChartPreview({ dark }: { dark: boolean }) {
  const bg = dark ? "#1a1a2e" : "#f8fafc";
  const txt = dark ? "#94a3b8" : "#334155";
  const grid = dark ? "#1e1e3a" : "#e2e8f0";
  return (
    <svg viewBox="0 0 400 260" className="w-full rounded-xl">
      <rect width="400" height="260" fill={bg} rx="12" />
      <text x="20" y="28" fill={txt} fontSize="13" fontWeight="bold">Progress — Last 8 Weeks</text>
      <line x1="50" y1="45" x2="50" y2="210" stroke={grid} strokeWidth="1" />
      {["100", "80", "60", "40", "20"].map((v, i) => (
        <g key={v}>
          <text x="14" y={52 + i * 40} fill={dark ? "#475569" : "#94a3b8"} fontSize="9">{v}%</text>
          <line x1="48" y1={48 + i * 40} x2="380" y2={48 + i * 40} stroke={grid} strokeWidth="0.5" strokeDasharray="4" />
        </g>
      ))}
      <line x1="50" y1="210" x2="380" y2="210" stroke={grid} strokeWidth="1" />
      <polyline fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points="70,140 112,120 154,100 196,95 238,80 280,70 322,55 364,50" />
      {[[70, 140], [112, 120], [154, 100], [196, 95], [238, 80], [280, 70], [322, 55], [364, 50]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="4" fill="#8b5cf6" stroke={bg} strokeWidth="2" />
      ))}
      <polygon points="70,140 112,120 154,100 196,95 238,80 280,70 322,55 364,50 364,210 70,210" fill="url(#areaGrad2)" opacity="0.2" />
      <defs>
        <linearGradient id="areaGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"].map((w, i) => (
        <text key={w} x={64 + i * 42} y="228" fill={dark ? "#475569" : "#94a3b8"} fontSize="9">{w}</text>
      ))}
    </svg>
  );
}
