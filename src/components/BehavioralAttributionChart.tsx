import React from 'react';
import { SubscriberRecord } from '../types';
import { calculateFleetFeatureAttributions } from '../engine/jevModel';

interface BehavioralAttributionChartProps {
  subscribers: SubscriberRecord[];
}

export const BehavioralAttributionChart: React.FC<BehavioralAttributionChartProps> = ({
  subscribers,
}) => {
  const attributions = calculateFleetFeatureAttributions(subscribers);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-100">
            Fleet Behavioral Feature Attribution (SHAP)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Decomposed churn variance across Jev AI categorical dimensions
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400 font-medium">
          Top 5 Global Drivers
        </span>
      </div>

      <div className="space-y-3 mt-4">
        {attributions.map((attr) => {
          const barColor =
            attr.category === 'Friction'
              ? 'bg-rose-500'
              : attr.category === 'Engagement'
              ? 'bg-amber-500'
              : attr.category === 'Economic'
              ? 'bg-cyan-500'
              : 'bg-indigo-500';

          return (
            <div key={attr.feature} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-200 font-medium truncate max-w-[240px]">
                  {attr.feature}
                </span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-slate-400 text-[11px]">{attr.delta}</span>
                  <span className="text-slate-100 font-semibold">{attr.impactScore}%</span>
                </div>
              </div>

              {/* Progress track */}
              <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(100, attr.impactScore * 2.8)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span>Friction &amp; session decay account for <strong>63%</strong> of critical flight triggers</span>
        <span className="text-slate-400">Model: Jev-Parallel-Array-v2</span>
      </div>
    </div>
  );
};
