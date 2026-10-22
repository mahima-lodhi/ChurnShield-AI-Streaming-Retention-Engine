import React from 'react';
import { SubscriberRecord } from '../types';
import { getLoyaltyFootprintMetrics } from '../engine/jevModel';

interface LoyaltyFootprintRadarProps {
  subscriber: SubscriberRecord | null;
  onOpenPlaybook: (sub: SubscriberRecord) => void;
}

export const LoyaltyFootprintRadar: React.FC<LoyaltyFootprintRadarProps> = ({
  subscriber,
  onOpenPlaybook,
}) => {
  if (!subscriber) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 text-center flex flex-col items-center justify-center min-h-[360px] text-slate-400">
        <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-3 text-slate-300">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-300">No Subscriber Selected</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Select a subscriber from the Grouping Matrix or Data Table to examine their real-time Loyalty Footprint.
        </p>
      </div>
    );
  }

  const metrics = getLoyaltyFootprintMetrics(subscriber.parallelArray);
  const size = 300;
  const center = size / 2;
  const radius = 100;
  const numAxes = metrics.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // Function to calculate (x, y) given radius and index
  const getCoordinates = (value: number, index: number, maxVal = 100) => {
    const r = (value / maxVal) * radius;
    const angle = index * angleStep - Math.PI / 2; // start at top (12 o'clock)
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Build polygon path points
  const subscriberPoints = metrics
    .map((m, i) => {
      const { x, y } = getCoordinates(m.value, i);
      return `${x},${y}`;
    })
    .join(' ');

  const benchmarkPoints = metrics
    .map((m, i) => {
      const { x, y } = getCoordinates(m.benchmark, i);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative backdrop-blur-sm">
      <div className="flex items-start justify-between mb-3 border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-100">
              Subscriber Loyalty Footprint
            </h3>
            <span
              className={`text-xs font-mono px-2 py-0.5 rounded font-medium ${
                subscriber.riskTier === 'Critical'
                  ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                  : subscriber.riskTier === 'Moderate'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {subscriber.riskTier} ({(subscriber.riskScore * 100).toFixed(0)}%)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            <span className="text-slate-200 font-medium">{subscriber.name}</span> · {subscriber.plan} · ${subscriber.mrr}/mo · {subscriber.tenureMonths}m tenure
          </p>
        </div>
        <button
          onClick={() => onOpenPlaybook(subscriber)}
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 cursor-pointer"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Run AI Playbook
        </button>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Radar SVG */}
        <div className="relative w-[260px] h-[260px] flex-shrink-0">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full select-none">
            {/* Concentric guide webs */}
            {[25, 50, 75, 100].map((level) => {
              const pts = Array.from({ length: numAxes })
                .map((_, i) => {
                  const { x, y } = getCoordinates(level, i);
                  return `${x},${y}`;
                })
                .join(' ');
              return (
                <polygon
                  key={`web-${level}`}
                  points={pts}
                  fill="none"
                  stroke="#334155"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                  opacity="0.4"
                />
              );
            })}

            {/* Axis spokes & labels */}
            {metrics.map((m, i) => {
              const outer = getCoordinates(100, i);
              const labelPos = getCoordinates(124, i);
              return (
                <g key={`axis-${m.axis}`}>
                  <line
                    x1={center}
                    y1={center}
                    x2={outer.x}
                    y2={outer.y}
                    stroke="#475569"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y + 3}
                    fill="#94a3b8"
                    fontSize="9"
                    textAnchor="middle"
                    className="font-medium"
                  >
                    {m.axis}
                  </text>
                </g>
              );
            })}

            {/* Benchmark Cohort Polygon (Emerald dashed) */}
            <polygon
              points={benchmarkPoints}
              fill="rgba(16, 185, 129, 0.08)"
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.75"
            />

            {/* Current Subscriber Footprint Polygon (Cyan solid with glow) */}
            <polygon
              points={subscriberPoints}
              fill={
                subscriber.riskTier === 'Critical'
                  ? 'rgba(244, 63, 94, 0.25)'
                  : subscriber.riskTier === 'Moderate'
                  ? 'rgba(245, 158, 11, 0.25)'
                  : 'rgba(56, 189, 248, 0.25)'
              }
              stroke={
                subscriber.riskTier === 'Critical'
                  ? '#f43f5e'
                  : subscriber.riskTier === 'Moderate'
                  ? '#f59e0b'
                  : '#38bdf8'
              }
              strokeWidth="2.2"
            />

            {/* Vertices for subscriber */}
            {metrics.map((m, i) => {
              const pt = getCoordinates(m.value, i);
              return (
                <circle
                  key={`pt-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#ffffff"
                  stroke={
                    subscriber.riskTier === 'Critical'
                      ? '#f43f5e'
                      : subscriber.riskTier === 'Moderate'
                      ? '#f59e0b'
                      : '#38bdf8'
                  }
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>

        {/* Breakdown table & legend */}
        <div className="w-full space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1 border-b border-slate-800 pb-1.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 bg-cyan-400 inline-block rounded" />
              <span>Subscriber Footprint</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1 border-b border-dashed border-emerald-400 inline-block" />
              <span>Retained Benchmark</span>
            </span>
          </div>

          <div className="space-y-1.5">
            {metrics.map((m) => {
              const delta = m.value - m.benchmark;
              const isPositive = delta >= 0;
              return (
                <div
                  key={m.axis}
                  className="flex items-center justify-between py-1 px-2 rounded bg-slate-800/40 border border-slate-800/60"
                >
                  <span className="text-slate-300 font-medium text-[11px]">{m.axis}</span>
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-slate-100 font-semibold">{m.value}</span>
                    <span className="text-slate-400 text-[10px]">/ {m.benchmark}</span>
                    <span
                      className={`text-[10px] w-10 text-right ${
                        isPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPositive ? `+${delta}` : delta}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2 p-2 bg-slate-950/60 rounded border border-slate-800 text-[11px] text-slate-300">
            <span className="text-slate-400 font-medium">Primary Deficit: </span>
            <span className="text-amber-300">{subscriber.primaryRiskFactor}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
