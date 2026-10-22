import React, { useState } from 'react';
import { PythonTransactionRecord } from '../types';

interface SubscriberPatternsChartProps {
  records: PythonTransactionRecord[];
}

export const SubscriberPatternsChart: React.FC<SubscriberPatternsChartProps> = ({ records }) => {
  const [hoveredPoint, setHoveredPoint] = useState<PythonTransactionRecord | null>(null);

  // Chart Dimensions
  const width = 580;
  const height = 240;
  const padding = { top: 20, right: 30, bottom: 40, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Scales: X = tenure (1 to 40 months), Y = monthly stream hours (0 to 65 hours)
  const maxTenure = 40;
  const maxHours = 65;

  const getX = (tenure: number) => padding.left + (tenure / maxTenure) * innerWidth;
  const getY = (hours: number) => padding.top + (1 - hours / maxHours) * innerHeight;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Subscriber Patterns Over Time</span>
            <span className="text-xs font-mono text-cyan-400 font-normal">
              (Tenure vs Stream Volume)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            X: Account Tenure (Months) · Y: Monthly Streaming Hours · Point Color: Loyalty Risk Level
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400 font-sans">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
            Safe
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            Watchlist
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
            High Risk
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none font-sans">
          {/* Grid lines */}
          {[0, 15, 30, 45, 60].map((h) => {
            const y = getY(h);
            return (
              <g key={`y-grid-${h}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  opacity="0.3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize="9"
                  textAnchor="end"
                  fontFamily="JetBrains Mono"
                >
                  {h}h
                </text>
              </g>
            );
          })}

          {[5, 10, 20, 30, 40].map((t) => {
            const x = getX(t);
            return (
              <g key={`x-grid-${t}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + innerHeight}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  opacity="0.25"
                />
                <text
                  x={x}
                  y={padding.top + innerHeight + 16}
                  fill="#94a3b8"
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  {t}m
                </text>
              </g>
            );
          })}

          {/* Healthy Engagement Zone Line */}
          <line
            x1={padding.left}
            y1={getY(20)}
            x2={padding.left + innerWidth}
            y2={getY(20)}
            stroke="#10b981"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.4"
          />
          <text
            x={padding.left + innerWidth - 6}
            y={getY(20) - 4}
            fill="#34d399"
            fontSize="9"
            textAnchor="end"
            fontFamily="JetBrains Mono"
          >
            Engagement Threshold (20h/mo)
          </text>

          {/* Plot Subscriber Points */}
          {records.map((r) => {
            const cx = getX(r.tenure_months);
            const cy = getY(r.monthly_stream_hours);
            const isHovered = hoveredPoint?.account_id === r.account_id;

            const color =
              r.loyalty_level === 'High Risk (Critical)'
                ? '#f43f5e'
                : r.loyalty_level === 'Medium Risk (Watchlist)'
                ? '#f59e0b'
                : '#10b981';

            return (
              <g
                key={r.account_id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(r)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill={color}
                  fillOpacity={isHovered ? 1 : 0.8}
                  stroke={isHovered ? '#ffffff' : '#0f172a'}
                  strokeWidth={isHovered ? 2 : 1}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-950/95 border border-slate-700 rounded-lg p-2.5 shadow-xl text-xs w-56 backdrop-blur-md"
            style={{
              left: `${Math.min(70, Math.max(10, (getX(hoveredPoint.tenure_months) / width) * 100))}%`,
              top: `${Math.max(10, (getY(hoveredPoint.monthly_stream_hours) / height) * 100 - 35)}%`,
            }}
          >
            <div className="font-semibold text-slate-100 flex justify-between border-b border-slate-800 pb-1 mb-1">
              <span>{hoveredPoint.customer_name}</span>
              <span className="font-mono text-cyan-400">{hoveredPoint.account_id}</span>
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Tenure:</span>
                <span className="font-mono">{hoveredPoint.tenure_months} months</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Stream:</span>
                <span className="font-mono">{hoveredPoint.monthly_stream_hours} hrs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Days Inactive:</span>
                <span className="font-mono">{hoveredPoint.days_since_stream} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Loyalty Level:</span>
                <span className="font-medium text-amber-300">{hoveredPoint.loyalty_level}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
        <span>Subscribers with &lt; 8 monthly stream hours show an <strong>82% cancellation rate</strong></span>
        <span className="font-mono text-slate-400">Pearson Correlation r = -0.74</span>
      </div>
    </div>
  );
};
