import React from 'react';
import { DatasetMeta } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeDataset: DatasetMeta;
  onRunBatchInference: () => void;
  isRecomputing: boolean;
  onOpenBatchModal: () => void;
  criticalCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  activeDataset,
  onRunBatchInference,
  isRecomputing,
  onOpenBatchModal,
  criticalCount,
}) => {
  return (
    <header className="bg-slate-950/90 border-b border-slate-800/80 px-4 lg:px-6 py-3 sticky top-0 z-20 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        {/* Left Side: Brand and Dataset Details */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-100 hidden sm:inline">
                ChurnShield AI
              </span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="text-xs font-medium text-slate-300">
                Streaming Retention Engine
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">
                {activeDataset.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5 hidden md:block truncate max-w-md">
              Ingested: {activeDataset.name} ({activeDataset.recordsCount} subs)
            </p>
          </div>
        </div>

        {/* Right Side: Operational Controls */}
        <div className="flex items-center gap-2.5">
          {/* Real-time Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Parallel Matrix Live</span>
          </div>

          {/* Re-compute Zero-Shot Matrix Button */}
          <button
            onClick={onRunBatchInference}
            disabled={isRecomputing}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 text-cyan-400 ${isRecomputing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="font-sans">
              {isRecomputing ? 'Computing...' : 'Recalculate Zero-Shot'}
            </span>
          </button>

          {/* Critical Cohort Action */}
          <button
            onClick={onOpenBatchModal}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-rose-600/30 cursor-pointer"
          >
            <span>Shield Critical ({criticalCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
};
