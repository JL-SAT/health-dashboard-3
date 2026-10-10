import React, { useState } from 'react';
import { MOM_MONTHLY_DATA, MonthlyPulseStat } from '../lib/momStats';

interface PulseTrendGraphProps {
  isThai?: boolean;
}

export const PulseTrendGraph: React.FC<PulseTrendGraphProps> = ({ isThai = false }) => {
  const [hoveredPoint, setHoveredPoint] = useState<MonthlyPulseStat | null>(null);

  const minPulse = 70;
  const maxPulse = 95;
  const height = 180;
  const width = 500;
  const paddingX = 35;
  const paddingY = 25;

  const points = MOM_MONTHLY_DATA.map((d, i) => {
    const x = paddingX + (i / (MOM_MONTHLY_DATA.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d.avgPulse - minPulse) / (maxPulse - minPulse)) * (height - paddingY * 2);
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="w-full bg-white dark:bg-neutral-900 rounded-xl p-4 border border-stone-200 dark:border-neutral-800">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span>{isThai ? 'กราฟแนวโน้มชีพจรเฉลี่ยรายเดือน (ข้อมูลจริง)' : 'Monthly Average Pulse Trend (Real Data)'}</span>
          </h4>
          <p className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5">
            {isThai ? 'ชีพจรเฉลี่ยรวม: 83.4 bpm · อยู่ในเกณฑ์ที่เสถียรดี' : 'Overall Average: 83.4 bpm · Consistent Resting Heart Rate'}
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/60">
            {hoveredPoint ? `${hoveredPoint.avgPulse} bpm` : '80-88 bpm'}
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[75, 80, 85, 90].map((val) => {
            const y = height - paddingY - ((val - minPulse) / (maxPulse - minPulse)) * (height - paddingY * 2);
            return (
              <g key={val}>
                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="currentColor" strokeDasharray="3 3" className="text-stone-200 dark:text-neutral-800" strokeWidth="1" />
                <text x={paddingX - 6} y={y + 3} textAnchor="end" className="text-[10px] font-mono fill-stone-400 dark:fill-neutral-500">{val}</text>
              </g>
            );
          })}

          {/* Shaded Area */}
          <path d={areaD} fill="url(#pulseGradient)" />

          {/* Trend Line */}
          <path d={pathD} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Points */}
          {points.map((p, i) => (
            <g key={p.month} onMouseEnter={() => setHoveredPoint(p)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer">
              <circle cx={p.x} cy={p.y} r={hoveredPoint?.month === p.month ? 6 : 3.5} fill={hoveredPoint?.month === p.month ? '#dc2626' : '#ef4444'} stroke="#ffffff" strokeWidth="1.5" />
              {/* X Axis Labels on alternate or key months */}
              {(i % 2 === 0 || i === points.length - 1) && (
                <text x={p.x} y={height - 5} textAnchor="middle" className="text-[9px] font-mono fill-stone-500 dark:fill-neutral-400">
                  {isThai ? p.labelTh : p.label}
                </text>
              )}
            </g>
          ))}
        </svg>

        {/* Hover info tooltip */}
        {hoveredPoint && (
          <div className="absolute top-1 right-2 text-right bg-stone-900/90 text-white text-[11px] px-2.5 py-1 rounded shadow-md pointer-events-none backdrop-blur-sm">
            <span>{isThai ? hoveredPoint.labelTh : hoveredPoint.label}: </span>
            <span className="font-bold text-red-400">{hoveredPoint.avgPulse} bpm</span>
            <span className="text-stone-300"> ({hoveredPoint.avgSys}/{hoveredPoint.avgDia} mmHg)</span>
          </div>
        )}
      </div>
    </div>
  );
};
