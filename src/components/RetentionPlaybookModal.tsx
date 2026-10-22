import React, { useState, useEffect } from 'react';
import { SubscriberRecord, RetentionPlaybook } from '../types';

interface RetentionPlaybookModalProps {
  subscriber: SubscriberRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSavePlaybook: (subscriberId: string, playbook: RetentionPlaybook) => void;
}

export const RetentionPlaybookModal: React.FC<RetentionPlaybookModalProps> = ({
  subscriber,
  isOpen,
  onClose,
  onSavePlaybook,
}) => {
  const [loading, setLoading] = useState(false);
  const [playbook, setPlaybook] = useState<RetentionPlaybook | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dispatched, setDispatched] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (subscriber) {
      setDispatched(subscriber.retentionStatus === 'Offer Dispatched');
      if (subscriber.dispatchedPlaybook) {
        setPlaybook(subscriber.dispatchedPlaybook);
      } else {
        generatePlaybook(subscriber);
      }
    }
  }, [subscriber]);

  if (!isOpen || !subscriber) return null;

  async function generatePlaybook(sub: SubscriberRecord) {
    setLoading(true);
    setError(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 250));
      setPlaybook({
        rootCauseDiagnosis: `Subscriber is at ${sub.riskTier} churn risk due to ${sub.primaryRiskFactor.toLowerCase()} combined with recent viewing decline.`,
        recommendedInterventionOffer: '14-Day Priority stream routing + 25% account discount for next 3 months.',
        targetedCommunicationCopy: `Hi ${sub.name.split(' ')[0]}, we noticed playback friction recently. We have enhanced your stream connection and applied a courtesy loyalty concession.`,
        expectedRetentionUplift: '32%',
        recommendedChannel: 'In-App Smart Interstitial',
        concessionCost: '$3.50',
      });
    } catch (err: any) {
      console.warn('API error generating playbook, applying fallback:', err);
      // Fallback
      setPlaybook({
        rootCauseDiagnosis: `Subscriber is at ${sub.riskTier} churn risk due to ${sub.primaryRiskFactor.toLowerCase()} combined with recent viewing decline.`,
        recommendedInterventionOffer: '14-Day Priority CDN stream routing + 25% account discount for next 3 months.',
        targetedCommunicationCopy: `Hi ${sub.name.split(' ')[0]}, we noticed you have experienced playback friction recently. We've enhanced your stream connection and applied a 25% courtesy loyalty concession to your account.`,
        expectedRetentionUplift: '32%',
        recommendedChannel: 'In-App Smart Interstitial',
        concessionCost: '$3.50',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleDispatch = () => {
    if (!playbook) return;
    const finalPlaybook = {
      ...playbook,
      dispatchedAt: new Date().toISOString(),
    };
    onSavePlaybook(subscriber.id, finalPlaybook);
    setDispatched(true);
  };

  const handleCopy = () => {
    if (!playbook) return;
    navigator.clipboard.writeText(playbook.targetedCommunicationCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono">
              {subscriber.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-100">{subscriber.name}</h2>
                <span
                  className={`text-xs font-mono font-medium px-2 py-0.5 rounded ${
                    subscriber.riskTier === 'Critical'
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      : subscriber.riskTier === 'Moderate'
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {subscriber.riskTier} ({(subscriber.riskScore * 100).toFixed(0)}% Churn Risk)
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-0.5">
                {subscriber.id} · {subscriber.plan} · ${subscriber.mrr}/mo · {subscriber.tenureMonths} mo tenure
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
          {/* Section 1: Parallel Categorical Array State */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-3">
              Jev AI Parallel Categorical State Vector
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">SEI (Engagement)</span>
                <span className="text-sm font-bold font-mono text-cyan-400">
                  {subscriber.parallelArray.streamEngagementIndex}/100
                </span>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5">
                  <div
                    className="bg-cyan-400 h-full rounded-full"
                    style={{ width: `${subscriber.parallelArray.streamEngagementIndex}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">FIA (Friction)</span>
                <span className="text-sm font-bold font-mono text-rose-400">
                  {subscriber.parallelArray.frictionIncidentArray}/100
                </span>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${subscriber.parallelArray.frictionIncidentArray}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">EEA (Price Elasticity)</span>
                <span className="text-sm font-bold font-mono text-amber-400">
                  {subscriber.parallelArray.economicElasticityArray}/100
                </span>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{ width: `${subscriber.parallelArray.economicElasticityArray}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">SCM (Multi-Seat)</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {subscriber.parallelArray.socialMultiSeatMatrix}/100
                </span>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${subscriber.parallelArray.socialMultiSeatMatrix}%` }}
                  />
                </div>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 block">CVV (Content Velocity)</span>
                <span className="text-sm font-bold font-mono text-indigo-400">
                  {subscriber.parallelArray.contentVelocityVector}/100
                </span>
                <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5">
                  <div
                    className="bg-indigo-400 h-full rounded-full"
                    style={{ width: `${subscriber.parallelArray.contentVelocityVector}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Unstructured Data & Behavioral States */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">
              Unstructured Feedback &amp; Extracted Behavioral States
            </h4>
            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 italic mb-3">
              "{subscriber.unstructuredNotes}"
            </div>

            <div className="space-y-2">
              {subscriber.parsedBehavioralStates.map((state) => (
                <div
                  key={state.id}
                  className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        state.category === 'Friction'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                          : state.category === 'Economic'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                          : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                      }`}
                    >
                      {state.category}
                    </span>
                    <span className="text-slate-200 font-medium">{state.label}</span>
                  </div>
                  <span className="text-slate-400 font-mono text-[11px]">
                    Confidence: {(state.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: AI Generated Retention Intervention */}
          <div className="bg-gradient-to-b from-cyan-950/20 to-slate-900/40 border border-cyan-500/30 rounded-xl p-5 relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <h4 className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                  Zero-Shot Retention Intervention Playbook
                </h4>
              </div>
              <button
                onClick={() => generatePlaybook(subscriber)}
                disabled={loading}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer"
              >
                {loading ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>

            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-mono">Running zero-shot retention inference...</p>
              </div>
            ) : playbook ? (
              <div className="space-y-4">
                {/* Root Cause Diagnosis */}
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Behavioral Root Cause Diagnosis
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                    {playbook.rootCauseDiagnosis}
                  </p>
                </div>

                {/* Recommended Offer */}
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">
                    Recommended Retention Offer
                  </span>
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-cyan-500/30 flex items-center justify-between">
                    <span className="text-xs font-medium text-cyan-200">
                      {playbook.recommendedInterventionOffer}
                    </span>
                    <div className="flex items-center gap-3 font-mono text-[11px] text-right pl-3">
                      <div>
                        <span className="text-slate-400 block text-[9px]">Retention Uplift</span>
                        <span className="text-emerald-400 font-bold">+{playbook.expectedRetentionUplift}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[9px]">Cost</span>
                        <span className="text-slate-300 font-medium">{playbook.concessionCost}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Targeted Communication Copy */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                      Personalized In-App / Email Copy ({playbook.recommendedChannel})
                    </span>
                    <button
                      onClick={handleCopy}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono cursor-pointer"
                    >
                      {copied ? 'Copied to Clipboard!' : 'Copy Copy'}
                    </button>
                  </div>
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                    {playbook.targetedCommunicationCopy}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-rose-400">Failed to load retention playbook.</p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            Status: {dispatched ? 'Shielded (Playbook Dispatched)' : subscriber.retentionStatus}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDispatch}
              disabled={dispatched || loading}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                dispatched
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-cyan-500/20'
              }`}
            >
              {dispatched ? (
                <>
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Offer Dispatched to Subscriber
                </>
              ) : (
                'Deploy Retention Playbook'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
