import React, { useState } from 'react';
import { SubscriberRecord } from '../types';

interface BatchInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  criticalSubscribers: SubscriberRecord[];
  onExecuteBatch: (targetIds: string[]) => void;
}

export const BatchInterventionModal: React.FC<BatchInterventionModalProps> = ({
  isOpen,
  onClose,
  criticalSubscribers,
  onExecuteBatch,
}) => {
  const [inProgress, setInProgress] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [selectedOfferType, setSelectedOfferType] = useState<'hybrid' | 'cdn' | 'discount'>('hybrid');

  if (!isOpen) return null;

  const totalMRR = criticalSubscribers.reduce((acc, s) => acc + s.mrr, 0);
  const annualized = totalMRR * 12;
  const targetIds = criticalSubscribers.map((s) => s.id);

  const handleStart = () => {
    setInProgress(true);
    setTimeout(() => {
      onExecuteBatch(targetIds);
      setInProgress(false);
      setCompleted(true);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Batch Zero-Shot Retention Intervention
              </h3>
              <p className="text-xs text-slate-400">
                Fleet deployment to {criticalSubscribers.length} critical subscribers
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs text-slate-300">
          {/* Financial summary */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-center">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Critical Accounts</span>
              <span className="text-lg font-bold text-rose-400">{criticalSubscribers.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">Monthly Revenue at Risk</span>
              <span className="text-lg font-bold text-slate-100">${totalMRR.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">ARR Protected</span>
              <span className="text-lg font-bold text-emerald-400">+${Math.round(annualized * 0.42).toLocaleString()}</span>
            </div>
          </div>

          {/* Strategy selection */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block">
              Automated Retention Playbook Strategy
            </label>

            <div className="space-y-2">
              <label
                onClick={() => setSelectedOfferType('hybrid')}
                className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-colors ${
                  selectedOfferType === 'hybrid'
                    ? 'bg-cyan-950/20 border-cyan-500/50 text-slate-100'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="offer"
                  checked={selectedOfferType === 'hybrid'}
                  onChange={() => {}}
                  className="mt-0.5 text-cyan-500"
                />
                <div>
                  <div className="font-semibold text-xs text-slate-200">
                    Jev AI Dynamic Multi-Vector Concession (Recommended)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Selects offer dynamically: CDN routing upgrade for buffering victims, 25% courtesy bill credit for price-sensitive accounts, and personalized premiere unlocked queue for catalog fatigued accounts.
                  </div>
                </div>
              </label>

              <label
                onClick={() => setSelectedOfferType('discount')}
                className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-colors ${
                  selectedOfferType === 'discount'
                    ? 'bg-cyan-950/20 border-cyan-500/50 text-slate-100'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400'
                }`}
              >
                <input
                  type="radio"
                  name="offer"
                  checked={selectedOfferType === 'discount'}
                  onChange={() => {}}
                  className="mt-0.5 text-cyan-500"
                />
                <div>
                  <div className="font-semibold text-xs text-slate-200">
                    Flat 3-Month Loyalty Price Shield (20% Off)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Immediate concession applied to next 3 billing cycles with automated retention push message.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Status Display */}
          {completed && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Successfully deployed {criticalSubscribers.length} customized retention playbooks via webhook/in-app messaging!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
          >
            {completed ? 'Close Window' : 'Cancel'}
          </button>

          {!completed && (
            <button
              onClick={handleStart}
              disabled={inProgress || criticalSubscribers.length === 0}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-600/30 disabled:opacity-50"
            >
              {inProgress ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Dispatching to Fleet...</span>
                </>
              ) : (
                <>
                  <span>Deploy {criticalSubscribers.length} Retention Playbooks</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
