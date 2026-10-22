import React from 'react';
import { PythonTransactionRecord } from '../types';

interface LoyaltyLevelChartProps {
  records: PythonTransactionRecord[];
  activeFilter: string;
  onFilterChange: (level: string) => void;
}

export const LoyaltyLevelChart: React.FC<LoyaltyLevelChartProps> = ({
  records,
  activeFilter,
  onFilterChange,
}) => {
  const total = records.length;
  if (total === 0) return null;

  const safeList = records.filter((r) => r.loyalty_level === 'High Loyalty (Safe)');
  const watchlistList = records.filter((r) => r.loyalty_level === 'Medium Risk (Watchlist)');
  const criticalList = records.filter((r) => r.loyalty_level === 'High Risk (Critical)');

  const safePct = Math.round((safeList.length / total) * 100);
  const watchPct = Math.round((watchlistList.length / total) * 100);
  const critPct = Math.round((criticalList.length / total) * 100);

  const safeMRR = safeList.reduce((acc, r) => acc + r.monthly_fee, 0);
  const watchMRR = watchlistList.reduce((acc, r) => acc + r.monthly_fee, 0);
  const critMRR = criticalList.reduce((acc, r) => acc + r.monthly_fee, 0);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>Customer Loyalty Level Distribution</span>
            <span className="text-xs font-mono text-cyan-400 font-normal">
              (Python Classified)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Safe accounts vs at-risk accounts mapped across monthly billing and activity logs
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          {total} Customer Accounts Tracked
        </span>
      </div>

      {/* Clean Segmented Distribution Bar */}
      <div className="space-y-1.5 mb-4">
        <div className="h-3 w-full bg-slate-800 rounded-full flex overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${safePct}%` }}
            title={`High Loyalty (Safe): ${safeList.length} (${safePct}%)`}
          />
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${watchPct}%` }}
            title={`Medium Risk (Watchlist): ${watchlistList.length} (${watchPct}%)`}
          />
          <div
            className="bg-rose-500 h-full transition-all duration-300"
            style={{ width: `${critPct}%` }}
            title={`High Risk (Critical): ${criticalList.length} (${critPct}%)`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span className="text-emerald-400">{safePct}% Safe</span>
          <span className="text-amber-400">{watchPct}% Watchlist</span>
          <span className="text-rose-400">{critPct}% Critical</span>
        </div>
      </div>

      {/* Cohort Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Safe Cohort Card */}
        <button
          onClick={() => onFilterChange(activeFilter === 'High Loyalty (Safe)' ? 'all' : 'High Loyalty (Safe)')}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
            activeFilter === 'High Loyalty (Safe)'
              ? 'bg-emerald-950/30 border-emerald-500/60 shadow-sm'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              High Loyalty (Safe)
            </span>
            <span className="font-mono text-slate-300 font-bold">{safeList.length}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            MRR: ${safeMRR.toFixed(2)}/mo
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Avg Stream: 42h/mo · Inactive &lt; 3 days
          </div>
        </button>

        {/* Watchlist Card */}
        <button
          onClick={() => onFilterChange(activeFilter === 'Medium Risk (Watchlist)' ? 'all' : 'Medium Risk (Watchlist)')}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
            activeFilter === 'Medium Risk (Watchlist)'
              ? 'bg-amber-950/30 border-amber-500/60 shadow-sm'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Medium Risk (Watchlist)
            </span>
            <span className="font-mono text-slate-300 font-bold">{watchlistList.length}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            MRR: ${watchMRR.toFixed(2)}/mo
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Avg Stream: 12h/mo · Inactive 8–14 days
          </div>
        </button>

        {/* Critical Risk Card */}
        <button
          onClick={() => onFilterChange(activeFilter === 'High Risk (Critical)' ? 'all' : 'High Risk (Critical)')}
          className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
            activeFilter === 'High Risk (Critical)'
              ? 'bg-rose-950/30 border-rose-500/60 shadow-sm'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-rose-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              High Risk (Critical)
            </span>
            <span className="font-mono text-slate-300 font-bold">{criticalList.length}</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            MRR: ${critMRR.toFixed(2)}/mo
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Avg Stream: 4.8h/mo · Buffering 5.2x
          </div>
        </button>
      </div>
    </div>
  );
};
