import React, { useState } from 'react';
import { SubscriberRecord, ModelHyperparameters } from '../types';

interface GroupingMatrixScatterProps {
  subscribers: SubscriberRecord[];
  selectedSubscriber: SubscriberRecord | null;
  onSelectSubscriber: (subscriber: SubscriberRecord) => void;
  hyperparameters: ModelHyperparameters;
}

export const GroupingMatrixScatter: React.FC<GroupingMatrixScatterProps> = ({
  subscribers,
  selectedSubscriber,
  onSelectSubscriber,
  hyperparameters,
}) => {
  const [hoveredSub, setHoveredSub] = useState<SubscriberRecord | null>(null);

  // SVG dimensions
  const width = 640;
  const height = 340;
  const padding = { top: 25, right: 30, bottom: 45, left: 55 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Scales
  const getX = (sei: number) => padding.left + (sei / 100) * innerWidth;
  const getY = (risk: number) => padding.top + (1 - risk) * innerHeight;

  // Critical & Moderate threshold Y positions
  const critY = getY(hyperparameters.criticalThreshold);
  const modY = getY(hyperparameters.moderateThreshold);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            Zero-Shot Customer Grouping Matrix
            <span className="text-xs font-mono text-slate-400 font-normal">
              (Jev AI Parallel Categorical Space)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            X: Stream Engagement Index (SEI) · Y: Churn Risk Propensity · Bubble Radius: MRR ($)
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block shadow-sm shadow-rose-500/50" />
            Critical (&gt;{(hyperparameters.criticalThreshold * 100).toFixed(0)}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            Moderate ({(hyperparameters.moderateThreshold * 100).toFixed(0)}–{(hyperparameters.criticalThreshold * 100).toFixed(0)}%)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            Retained (&lt;{(hyperparameters.moderateThreshold * 100).toFixed(0)}%)
          </span>
          <span className="flex items-center gap-1.5 border-l border-slate-700/80 pl-2">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-cyan-400 inline-block" />
            Selected Target
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none font-sans"
        >
          <defs>
            <linearGradient id="critZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="retainedZoneGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.10" />
            </linearGradient>
          </defs>

          {/* Background Shaded Risk Zones */}
          <rect
            x={padding.left}
            y={padding.top}
            width={innerWidth}
            height={critY - padding.top}
            fill="url(#critZoneGrad)"
          />
          <rect
            x={padding.left}
            y={modY}
            width={innerWidth}
            height={padding.top + innerHeight - modY}
            fill="url(#retainedZoneGrad)"
          />

          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => {
            const x = getX(val);
            return (
              <g key={`x-grid-${val}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={padding.top + innerHeight}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.3"
                />
                <text
                  x={x}
                  y={padding.top + innerHeight + 16}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {[0, 0.25, 0.5, 0.75, 1.0].map((val) => {
            const y = getY(val);
            return (
              <g key={`y-grid-${val}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={padding.left + innerWidth}
                  y2={y}
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3}
                  fill="#94a3b8"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="JetBrains Mono"
                >
                  {(val * 100).toFixed(0)}%
                </text>
              </g>
            );
          })}

          {/* Critical Threshold Boundary Line */}
          <line
            x1={padding.left}
            y1={critY}
            x2={padding.left + innerWidth}
            y2={critY}
            stroke="#f43f5e"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.8"
          />
          <text
            x={padding.left + innerWidth - 6}
            y={critY - 5}
            fill="#fb7185"
            fontSize="10"
            textAnchor="end"
            fontFamily="JetBrains Mono"
          >
            Critical Threshold ({Math.round(hyperparameters.criticalThreshold * 100)}%)
          </text>

          {/* Moderate Threshold Boundary Line */}
          <line
            x1={padding.left}
            y1={modY}
            x2={padding.left + innerWidth}
            y2={modY}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.7"
          />
          <text
            x={padding.left + innerWidth - 6}
            y={modY - 5}
            fill="#fcd34d"
            fontSize="10"
            textAnchor="end"
            fontFamily="JetBrains Mono"
          >
            Moderate Threshold ({Math.round(hyperparameters.moderateThreshold * 100)}%)
          </text>

          {/* Axis Labels */}
          <text
            x={padding.left + innerWidth / 2}
            y={height - 8}
            fill="#cbd5e1"
            fontSize="11"
            textAnchor="middle"
            fontWeight="500"
          >
            Stream Engagement Index (SEI) →
          </text>

          <text
            transform={`rotate(-90)`}
            x={-(padding.top + innerHeight / 2)}
            y={16}
            fill="#cbd5e1"
            fontSize="11"
            textAnchor="middle"
            fontWeight="500"
          >
            Predicted Churn Propensity Risk (%) →
          </text>

          {/* Subscriber Data Points */}
          {subscribers.map((sub) => {
            const cx = getX(sub.parallelArray.streamEngagementIndex);
            const cy = getY(sub.riskScore);
            const isSelected = selectedSubscriber?.id === sub.id;
            const isHovered = hoveredSub?.id === sub.id;

            // Bubble radius proportional to MRR: $9.99 -> 4.5px, $24.99 -> 8.5px
            const r = 4 + (sub.mrr / 25) * 4.5;

            const fillColor =
              sub.riskTier === 'Critical'
                ? '#f43f5e'
                : sub.riskTier === 'Moderate'
                ? '#f59e0b'
                : '#10b981';

            return (
              <g
                key={sub.id}
                className="cursor-pointer transition-transform duration-150"
                onClick={() => onSelectSubscriber(sub)}
                onMouseEnter={() => setHoveredSub(sub)}
                onMouseLeave={() => setHoveredSub(null)}
              >
                {/* Selection target ring for the currently inspected subscriber */}
                {isSelected && (
                  <g pointerEvents="none">
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r + 6}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                      opacity="0.95"
                    />
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r + 11}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1"
                      opacity="0.4"
                    />
                  </g>
                )}
                {/* Main bubble */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? r + 3 : r}
                  fill={fillColor}
                  fillOpacity={isSelected ? 1.0 : isHovered ? 0.95 : 0.75}
                  stroke={isSelected ? '#ffffff' : '#0f172a'}
                  strokeWidth={isSelected ? 2 : 1}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Box */}
        {hoveredSub && (
          <div
            className="absolute pointer-events-none z-20 bg-slate-950/95 border border-slate-700/80 rounded-lg p-2.5 shadow-xl text-xs w-64 backdrop-blur-md"
            style={{
              left: `${Math.min(
                width - 240,
                Math.max(10, (getX(hoveredSub.parallelArray.streamEngagementIndex) / width) * 100)
              )}%`,
              top: `${Math.max(10, (getY(hoveredSub.riskScore) / height) * 100 - 30)}%`,
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 mb-1.5">
              <span className="font-semibold text-slate-100">{hoveredSub.name}</span>
              <span
                className={`font-mono font-medium ${
                  hoveredSub.riskTier === 'Critical'
                    ? 'text-rose-400'
                    : hoveredSub.riskTier === 'Moderate'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {(hoveredSub.riskScore * 100).toFixed(0)}% Risk
              </span>
            </div>
            <div className="space-y-0.5 text-slate-300 text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-400">Plan / MRR:</span>
                <span className="font-mono text-slate-200">
                  {hoveredSub.plan} · ${hoveredSub.mrr}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Stream SEI Index:</span>
                <span className="font-mono text-slate-200">
                  {hoveredSub.parallelArray.streamEngagementIndex}/100
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Buffering Incidents:</span>
                <span className="font-mono text-slate-200">
                  {hoveredSub.bufferingIncidents} / 10h
                </span>
              </div>
              <div className="mt-1 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400 italic truncate">
                Trigger: {hoveredSub.primaryRiskFactor}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1 border-t border-slate-800/60 pt-2">
        <span>Click any subscriber bubble to inspect footprint &amp; generate zero-shot retention playbook</span>
        <span className="font-mono text-slate-400">
          Showing {subscribers.length} total subscribers
        </span>
      </div>
    </div>
  );
};
