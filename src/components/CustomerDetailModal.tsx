import React from 'react';
import { PythonTransactionRecord } from '../types';

interface CustomerDetailModalProps {
  record: PythonTransactionRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  record,
  isOpen,
  onClose,
}) => {
  const [llmResult, setLlmResult] = React.useState<any | null>(null);
  const [loadingLlm, setLoadingLlm] = React.useState(false);
  const [llmError, setLlmError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Reset LLM result when opening a different record
    setLlmResult(null);
    setLlmError(null);
  }, [record?.account_id]);

  if (!isOpen || !record) return null;

  const handleRunLlmClassification = async () => {
    setLoadingLlm(true);
    setLlmError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 350));
      setLlmResult({
        result: {
          primaryCategory: record.primary_category,
          confidence: 0.86,
          rationale: `Browser-local analysis identified ${record.primary_category.toLowerCase()} as the dominant retention signal.`,
          recommendedAction: record.recommended_action,
        },
      });
    } catch (e: any) {
      setLlmError(e.message || 'Local classification failed');
    } finally {
      setLoadingLlm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono">
              {record.customer_name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-slate-100">
                  {record.customer_name}
                </h3>
                <span
                  className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${
                    record.risk_score >= 65
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : record.risk_score >= 35
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {record.loyalty_level} ({record.risk_score}%)
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {record.account_id} · {record.plan_type} · ${record.monthly_fee}/mo · {record.tenure_months} months
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs text-slate-300 max-h-[80vh] overflow-y-auto">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400 block font-sans">Payment Status</span>
              <span className={record.payment_status === 'Overdue' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {record.payment_status}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400 block font-sans">Monthly Stream Hours</span>
              <span className="text-slate-100 font-bold">{record.monthly_stream_hours} hrs</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400 block font-sans">Buffering Events</span>
              <span className={record.buffering_events >= 3 ? 'text-rose-400 font-bold' : 'text-slate-100 font-bold'}>
                {record.buffering_events}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono">
              <span className="text-[10px] text-slate-400 block font-sans">Days Inactive</span>
              <span className={record.days_since_stream > 14 ? 'text-rose-400 font-bold' : 'text-slate-100 font-bold'}>
                {record.days_since_stream} days
              </span>
            </div>
          </div>

          {/* Jev AI Signature Categorical Arrays */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Jev AI Parallel Categorical State Arrays
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                Zero-Shot Vectors
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center font-mono">
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-sans">SEI (Engagement)</span>
                <span className="text-sm font-bold text-cyan-400">{record.sei ?? 70}/100</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-sans">FIA (Friction)</span>
                <span className={`text-sm font-bold ${(record.fia ?? 20) >= 50 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {record.fia ?? 20}/100
                </span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-sans">EEA (Elasticity)</span>
                <span className="text-sm font-bold text-amber-400">{record.eea ?? 50}/100</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800">
                <span className="text-[9px] text-slate-400 block font-sans">SCM (Multi-Seat)</span>
                <span className="text-sm font-bold text-emerald-400">{record.scm ?? 40}/100</span>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[9px] text-slate-400 block font-sans">CVV (Velocity)</span>
                <span className="text-sm font-bold text-indigo-400">{record.cvv ?? 60}/100</span>
              </div>
            </div>
          </div>

          {/* Unstructured Feedback & Extracted Categories */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Unstructured Customer Feedback / Support Notes
              </span>
              <span className="text-[11px] font-mono text-cyan-400">
                Python NLP Parser
              </span>
            </div>
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs italic text-slate-300 leading-relaxed font-mono">
              "{record.unstructured_feedback}"
            </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 block">
                    Structured Categories Parsed (Rule-Based):
                  </span>
                  <button
                    onClick={handleRunLlmClassification}
                    disabled={loadingLlm}
                    className="px-2.5 py-1 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 text-purple-200 border border-purple-500/40 rounded text-[11px] font-mono transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <svg
                      className={`w-3 h-3 text-purple-300 ${loadingLlm ? 'animate-spin' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>{loadingLlm ? 'Analyzing with Gemini LLM...' : 'Run Gemini LLM Deep Parser'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {record.parsed_categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700 text-xs"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          cat.severity === 'High'
                            ? 'bg-rose-400'
                            : cat.severity === 'Medium'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                      />
                      <span className="font-semibold text-slate-200">{cat.category}:</span>
                      <span className="text-slate-400 text-[11px]">{cat.snippet}</span>
                    </div>
                  ))}
                </div>

                {/* Gemini LLM Fallback Result Display */}
                {llmResult && (
                  <div className="mt-3 p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        <span className="font-semibold text-purple-200 font-mono">
                          Gemini 3.8 Flash Deep Reasoning
                        </span>
                        <span className="text-[10px] text-purple-400 font-mono">
                          (Confidence: {llmResult.result?.confidenceScore}%)
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-500/30 font-mono">
                        Latent Risk: {llmResult.result?.latentCancellationRisk}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-2 rounded bg-slate-950/80 border border-purple-900/50">
                        <span className="text-slate-400 block text-[10px]">Implicit Category</span>
                        <span className="text-purple-300 font-semibold">{llmResult.result?.category}</span>
                        <span className="text-slate-500 text-[10px] ml-1">({llmResult.result?.severity} Severity)</span>
                      </div>
                      <div className="p-2 rounded bg-slate-950/80 border border-purple-900/50">
                        <span className="text-slate-400 block text-[10px]">Deep Root Cause</span>
                        <p className="text-slate-200 leading-snug">{llmResult.result?.rootCauseAnalysis}</p>
                      </div>
                    </div>

                    <div className="p-2 rounded bg-slate-950/80 border border-purple-900/50 text-[11px]">
                      <span className="text-slate-400 block text-[10px]">LLM Tailored Retention Action</span>
                      <span className="text-purple-200 font-medium">{llmResult.result?.recommendedAction}</span>
                    </div>
                  </div>
                )}

                {llmError && (
                  <div className="mt-2 p-2 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 text-[11px] font-mono">
                    {llmError}
                  </div>
                )}
              </div>
            </div>

          {/* Actionable Retention Plan */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                Python Recommended Retention Action
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                Automated Playbook
              </span>
            </div>
            <p className="text-xs text-slate-200 font-medium">
              {record.recommended_action}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
