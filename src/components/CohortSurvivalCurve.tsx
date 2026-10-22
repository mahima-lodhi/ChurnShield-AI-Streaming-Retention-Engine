import React, { useState } from 'react';

export const CohortSurvivalCurve: React.FC = () => {
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);

  // 12-month Kaplan-Meier estimated survival rates (%)
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const lowFriction = [100, 97, 95, 94, 92, 91, 90, 89, 88, 88, 87, 86];
  const highFriction = [100, 84, 71, 62, 53, 46, 42, 38, 35, 33, 31, 29];
  const priceSensitive = [100, 92, 81, 74, 69, 64, 60, 57, 54, 51, 49, 47];

  const width = 500;
  const height = 210;
  const padding = { top: 20, right: 25, bottom: 35, left: 45 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const getX = (m: number) => padding.left + ((m - 1) / (months.length - 1)) * innerWidth;
  const getY = (rate: number) => padding.top + (1 - (rate - 20) / 80) * innerHeight; // 20% to 100%

  const createPath = (data: number[]) => {
    return data
      .map((val, idx) => {
        const x = getX(months[idx]);
        const y = getY(val);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative backdrop-blur-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Cohort Churn Survival Decay (Kaplan-Meier)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Subscriber retention trajectory across 12 billing cycles by behavioral friction state
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-400 inline-block rounded" />
            Low Friction (FIA &lt; 20)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-400 inline-block rounded" />
            High Friction (FIA &gt; 60)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-amber-400 inline-block rounded" />
            Price Sensitive (EEA &gt; 70)
          </span>
        </div>
      </div>

      <div className="relative w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none">
          {/* Y Grid lines (20%, 40%, 60%, 80%, 100%) */}
          {[20, 40, 60, 80, 100].map((rate) => {
            const y = getY(rate);
            return (
              <g key={`y-${rate}`}>
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
                  {rate}%
                </text>
              </g>
            );
          })}

          {/* X Axis Months */}
          {months.map((m) => {
            const x = getX(m);
            return (
              <g key={`x-${m}`}>
                <text
                  x={x}
                  y={padding.top + innerHeight + 16}
                  fill="#94a3b8"
                  fontSize="9"
                  textAnchor="middle"
                  fontFamily="JetBrains Mono"
                >
                  M{m}
                </text>
              </g>
            );
          })}

          {/* Curves */}
          <path
            d={createPath(lowFriction)}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.2"
          />
          <path
            d={createPath(priceSensitive)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="1.8"
            strokeDasharray="3 2"
          />
          <path
            d={createPath(highFriction)}
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2.4"
          />

          {/* Interaction circles */}
          {months.map((m, idx) => {
            const x = getX(m);
            const isHovered = hoveredMonth === m;
            return (
              <g
                key={`pts-${m}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredMonth(m)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                <circle
                  cx={x}
                  cy={getY(lowFriction[idx])}
                  r={isHovered ? 4 : 2}
                  fill="#10b981"
                />
                <circle
                  cx={x}
                  cy={getY(priceSensitive[idx])}
                  r={isHovered ? 4 : 2}
                  fill="#f59e0b"
                />
                <circle
                  cx={x}
                  cy={getY(highFriction[idx])}
                  r={isHovered ? 5 : 2.5}
                  fill="#f43f5e"
                />
              </g>
            );
          })}
        </svg>

        {hoveredMonth !== null && (
          <div className="absolute top-2 right-4 bg-slate-950/90 border border-slate-700 rounded-lg p-2 text-xs shadow-lg font-mono">
            <div className="text-slate-300 font-semibold mb-1">Month {hoveredMonth} Retention</div>
            <div className="text-emerald-400">Low Friction: {lowFriction[hoveredMonth - 1]}%</div>
            <div className="text-amber-400">Price Sensitive: {priceSensitive[hoveredMonth - 1]}%</div>
            <div className="text-rose-400">High Friction: {highFriction[hoveredMonth - 1]}%</div>
          </div>
        )}
      </div>

      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
        <span>High playback friction accelerates 12-month cohort churn by <strong className="text-rose-400 font-semibold font-mono">57%</strong></span>
        <span className="text-slate-400 font-mono">Log-Rank Test p &lt; 0.0001</span>
      </div>
    </div>
  );
};
