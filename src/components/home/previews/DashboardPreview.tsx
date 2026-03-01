"use client";

import React from "react";

export default function DashboardPreview({ dark }: { dark: boolean }) {
  const bg = dark ? "#1a1a2e" : "#f8fafc";
  const hdr = dark ? "#6366f1" : "#8b5cf6";
  const alt = dark ? "#151530" : "#f1f5f9";
  const txt = dark ? "#94a3b8" : "#334155";
  const sub = dark ? "#64748b" : "#475569";
  return (
    <svg viewBox="0 0 400 280" className="w-full rounded-xl">
      <rect width="400" height="280" fill={bg} rx="12" />
      <rect x="0" y="0" width="400" height="36" fill={hdr} rx="12" />
      <rect x="0" y="24" width="400" height="12" fill={hdr} />
      <text x="16" y="24" fill="white" fontSize="13" fontWeight="bold">Dashboard — Weekly Overview</text>
      {["Day", "Category", "Amount", "Status", "Score", "Progress"].map((h, i) => (
        <g key={h}>
          <rect x={12 + i * 65} y="46" width="58" height="22" fill={dark ? "#1e1e3a" : "#e2e8f0"} rx="4" />
          <text x={18 + i * 65} y="61" fill={sub} fontSize="8" fontWeight="600">{h}</text>
        </g>
      ))}
      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
        const y = 76 + i * 24;
        return (
          <g key={day}>
            <rect x="12" y={y} width="378" height="22" fill={i % 2 === 0 ? (dark ? "#0f0f23" : "#ffffff") : alt} rx="3" />
            <text x="22" y={y + 15} fill={txt} fontSize="9">{day}</text>
            <text x="83" y={y + 15} fill="#8b5cf6" fontSize="9">{["Work", "Gym", "Study", "Code", "Plan", "Free", "Rest"][i]}</text>
            <text x="148" y={y + 15} fill={txt} fontSize="9">{["₹500", "₹200", "₹0", "₹350", "₹100", "₹800", "₹50"][i]}</text>
            <text x="213" y={y + 15} fill="#10b981" fontSize="9">{["Done", "Done", "Skip", "Done", "Done", "Done", "Rest"][i]}</text>
            <text x="278" y={y + 15} fill="#3b82f6" fontSize="9">{["85%", "92%", "70%", "88%", "95%", "78%", "—"][i]}</text>
            <rect x="340" y={y + 6} width="40" height="6" fill={dark ? "#1e1e3a" : "#e2e8f0"} rx="3" />
            <rect x="340" y={y + 6} width={[32, 38, 28, 35, 40, 30, 0][i]} height="6" fill="#8b5cf6" rx="3" />
          </g>
        );
      })}
      <rect x="12" y="250" width="120" height="5" fill="#8b5cf6" rx="2" opacity="0.3" />
      <rect x="12" y="250" width="85" height="5" fill="#8b5cf6" rx="2" />
      <text x="140" y="256" fill="#8b5cf6" fontSize="8" fontWeight="600">Weekly Goal: 71%</text>
    </svg>
  );
}
