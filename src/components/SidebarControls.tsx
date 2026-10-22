import React from 'react';
import { ModelHyperparameters, DatasetMeta } from '../types';
import { AVAILABLE_DATASETS } from '../data/kaggleDatasets';

interface SidebarControlsProps {
  isOpen: boolean;
  onToggle: () => void;
  activeDatasetId: string;
  onSelectDataset: (id: string) => void;
  hyperparameters: ModelHyperparameters;
  onUpdateHyperparameters: (newParams: ModelHyperparameters) => void;
  onResetHyperparameters: () => void;
  onOpenBatchModal: () => void;
  onOpenUploadModal: () => void;
  onExportData: (format: 'csv' | 'json') => void;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  isOpen,
  onToggle,
  activeDatasetId,
  onSelectDataset,
  hyperparameters,
  onUpdateHyperparameters,
  onResetHyperparameters,
  onOpenBatchModal,
  onOpenUploadModal,
  onExportData,
}) => {
  const activeDataset = AVAILABLE_DATASETS.find((d) => d.id === activeDatasetId) || AVAILABLE_DATASETS[0];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-72 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/20">
              CS
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 leading-tight">ChurnShield AI</h1>
              <p className="text-[10px] text-slate-400 font-mono">Streamlit Engine v2.4</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden text-slate-400 hover:text-slate-200 p-1"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Control Panels */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs text-slate-300">
          {/* Section 1: Kaggle Data Ingestion */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Kaggle Repository
              </label>
              <button
                onClick={onOpenUploadModal}
                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer"
              >
                + Ingest CSV
              </button>
            </div>

            <div className="space-y-1.5">
              {AVAILABLE_DATASETS.map((ds) => (
                <button
                  key={ds.id}
                  onClick={() => onSelectDataset(ds.id)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    activeDatasetId === ds.id
                      ? 'bg-slate-900 border-cyan-500/50 text-slate-100 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="truncate">{ds.name}</span>
                    {activeDatasetId === ds.id && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex justify-between">
                    <span>{ds.recordsCount} parsed records</span>
                    <span className="text-emerald-400">{ds.benchmarkAccuracy}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-2.5 rounded bg-slate-900/70 border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
              <div className="font-semibold text-slate-300">Dataset Specs:</div>
              <div className="italic text-slate-400">{activeDataset.description}</div>
              <div className="font-mono text-[9px] text-slate-500 truncate mt-1">
                {activeDataset.source}
              </div>
            </div>
          </div>

          {/* Section 2: Jev AI Model Hyperparameters */}
          <div className="space-y-4 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Jev AI Parameters
              </label>
              <button
                onClick={onResetHyperparameters}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-mono cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Critical Threshold Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Critical Risk Cutoff</span>
                <span className="font-mono text-rose-400 font-medium">
                  {(hyperparameters.criticalThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.85"
                step="0.02"
                value={hyperparameters.criticalThreshold}
                onChange={(e) =>
                  onUpdateHyperparameters({
                    ...hyperparameters,
                    criticalThreshold: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-rose-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] text-slate-500 block">
                Subscribers above this score enter Critical tier
              </span>
            </div>

            {/* Moderate Threshold Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Moderate Risk Cutoff</span>
                <span className="font-mono text-amber-400 font-medium">
                  {(hyperparameters.moderateThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.50"
                step="0.02"
                value={hyperparameters.moderateThreshold}
                onChange={(e) =>
                  onUpdateHyperparameters({
                    ...hyperparameters,
                    moderateThreshold: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Friction Multiplier */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Friction Multiplier (FIA)</span>
                <span className="font-mono text-cyan-400 font-medium">
                  {hyperparameters.frictionMultiplier.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.05"
                value={hyperparameters.frictionMultiplier}
                onChange={(e) =>
                  onUpdateHyperparameters({
                    ...hyperparameters,
                    frictionMultiplier: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <span className="text-[10px] text-slate-500 block">
                Weights buffering incidents and crashes
              </span>
            </div>

            {/* Content Velocity Weight */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Content Velocity (CVV)</span>
                <span className="font-mono text-indigo-400 font-medium">
                  {hyperparameters.contentVelocityWeight.toFixed(2)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={hyperparameters.contentVelocityWeight}
                onChange={(e) =>
                  onUpdateHyperparameters({
                    ...hyperparameters,
                    contentVelocityWeight: parseFloat(e.target.value),
                  })
                }
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Section 3: Batch Actions & Export */}
          <div className="space-y-2 pt-3 border-t border-slate-800/80">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Fleet Operations
            </label>

            <button
              onClick={onOpenBatchModal}
              className="w-full py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Batch Shield Critical Cohort
            </button>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => onExportData('csv')}
                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[11px] font-medium font-mono text-center cursor-pointer transition-colors"
              >
                Export CSV
              </button>
              <button
                onClick={() => onExportData('json')}
                className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded text-[11px] font-medium font-mono text-center cursor-pointer transition-colors"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono text-center bg-slate-950/80">
          <span>Real-time Zero-Shot Engine</span>
          <span className="mx-1.5">·</span>
          <span>LangChain-Typesafe</span>
        </div>
      </aside>
    </>
  );
};
