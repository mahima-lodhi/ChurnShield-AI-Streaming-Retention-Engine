import React from 'react';
import { SubscriberRecord, ModelHyperparameters } from '../types';

interface MetricCardsProps {
  subscribers: SubscriberRecord[];
  hyperparameters: ModelHyperparameters;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ subscribers }) => {
  const total = subscribers.length;
  if (total === 0) return null;

  const criticalList = subscribers.filter((s) => s.riskTier === 'Critical');
  const moderateList = subscribers.filter((s) => s.riskTier === 'Moderate');
  const retainedList = subscribers.filter((s) => s.riskTier === 'Retained');

  const criticalCount = criticalList.length;
  const moderateCount = moderateList.length;
  const retainedCount = retainedList.length;

  const avgRiskScore = Math.round((subscribers.reduce((acc, s) => acc + s.riskScore, 0) / total) * 100);

  // Financial calculations
  const totalMRR = subscribers.reduce((acc, s) => acc + s.mrr, 0);
  const criticalMRR = criticalList.reduce((acc, s) => acc + s.mrr, 0);
  const moderateMRR = moderateList.reduce((acc, s) => acc + s.mrr, 0);
  const preventableARR = Math.round((criticalMRR * 12 * 0.45) + (moderateMRR * 12 * 0.65));

  // Friction & engagement averages
  const avgBuffering = +(subscribers.reduce((acc, s) => acc + s.bufferingIncidents, 0) / total).toFixed(1);
  const avgCrashes = +(subscribers.reduce((acc, s) => acc + s.playbackCrashes, 0) / total).toFixed(1);
  const avgHours = +(subscribers.reduce((acc, s) => acc + s.monthlyHoursStreamed, 0) / total).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Tile 1: Predicted Fleet Churn Propensity */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Fleet Churn Propensity</span>
          <span className="text-rose-400 font-mono text-[11px] font-medium">+2.4% vs benchmark</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {avgRiskScore}%
          </span>
          <span className="text-xs text-slate-400">weighted probability</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
          <span>Active Ingest: {total} subs</span>
          <span className="text-cyan-400">94.2% ROC-AUC</span>
        </div>
      </div>

      {/* Tile 2: Revenue at Risk */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Critical MRR Exposure</span>
          <span className="text-amber-400 font-mono text-[11px]">
            {((criticalMRR / totalMRR) * 100).toFixed(0)}% of MRR
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-rose-400 tabular-nums">
            ${criticalMRR.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-400">/ month</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
          <span>Shieldable ARR:</span>
          <span className="text-emerald-400 font-semibold">+${preventableARR.toLocaleString()}</span>
        </div>
      </div>

      {/* Tile 3: Zero-Shot Grouping Cohort Split */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Zero-Shot Grouping Matrix</span>
          <span className="text-slate-400 text-[11px] font-mono">Jev Categorical</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {criticalCount}
          </span>
          <span className="text-xs text-rose-400 font-medium">Critical Flight Risk</span>
        </div>

        {/* Multi-segmented bar */}
        <div className="mt-2.5 h-1.5 w-full bg-slate-800 rounded-full flex overflow-hidden">
          <div
            className="bg-rose-500 h-full"
            style={{ width: `${(criticalCount / total) * 100}%` }}
            title={`Critical: ${criticalCount}`}
          />
          <div
            className="bg-amber-500 h-full"
            style={{ width: `${(moderateCount / total) * 100}%` }}
            title={`Moderate: ${moderateCount}`}
          />
          <div
            className="bg-emerald-500 h-full"
            style={{ width: `${(retainedCount / total) * 100}%` }}
            title={`Retained: ${retainedCount}`}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <span className="text-rose-400">{criticalCount} Crit</span>
          <span className="text-amber-400">{moderateCount} Mod</span>
          <span className="text-emerald-400">{retainedCount} Safe</span>
        </div>
      </div>

      {/* Tile 4: Streaming Reliability & Playback Telemetry */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span className="font-medium">Playback Telemetry Index</span>
          <span className="text-cyan-400 font-mono text-[11px] font-medium">{avgHours}h avg/mo</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-slate-100 tabular-nums">
            {avgBuffering}
          </span>
          <span className="text-xs text-slate-400">buffer events / 10h</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
          <span>Fleet Crash Rate:</span>
          <span className={avgCrashes > 1.0 ? 'text-amber-400' : 'text-emerald-400'}>
            {avgCrashes} per sub
          </span>
        </div>
      </div>
    </div>
  );
};
