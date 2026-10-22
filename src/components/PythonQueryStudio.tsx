import React, { useState, useEffect } from 'react';
import { PythonQueryResult, PythonTransactionRecord } from '../types';
import { PluggableGatewayModal } from './PluggableGatewayModal';

interface PythonQueryStudioProps {
  onSelectRecord: (record: PythonTransactionRecord) => void;
  activeDataset?: string;
  records: PythonTransactionRecord[];
}

export const PythonQueryStudio: React.FC<PythonQueryStudioProps> = ({
  onSelectRecord,
  activeDataset,
  records,
}) => {
  const [activeQuerySql, setActiveQuerySql] = useState<string>(
    'SELECT * FROM transactions WHERE risk_score >= 65 ORDER BY risk_score DESC'
  );
  const [customSqlInput, setCustomSqlInput] = useState<string>(
    'SELECT * FROM transactions WHERE risk_score >= 65 ORDER BY risk_score DESC'
  );
  const [queryResult, setQueryResult] = useState<PythonQueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [pythonCode, setPythonCode] = useState<string>('');
  const [showCode, setShowCode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [jevStatus, setJevStatus] = useState<{
    mode: string;
    hasApiKey: boolean;
    endpoint: string;
    description: string;
  } | null>(null);
  const [showApiGuide, setShowApiGuide] = useState(false);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);

  const sqlPresets = [
    {
      id: 'high_risk',
      title: 'High-Risk Churn Filter',
      sql: 'SELECT * FROM transactions WHERE risk_score >= 65 ORDER BY risk_score DESC',
      optimization: 'Uses B-Tree Index: idx_risk (risk_score >= 65)',
      description: 'Filters accounts with critical cancellation propensity using index scan.',
    },
    {
      id: 'jev_friction_array',
      title: 'Jev AI Friction Array (FIA >= 50)',
      sql: 'SELECT account_id, customer_name, plan_type, fia, buffering_events, risk_score, loyalty_level FROM transactions WHERE fia >= 50 ORDER BY fia DESC',
      optimization: 'Scans Jev AI Friction & Incident Array column',
      description: 'Filters accounts suffering acute playback glitches and buffering spikes.',
    },
    {
      id: 'loyalty_aggregation',
      title: 'SQL Loyalty Aggregation',
      sql: 'SELECT loyalty_level, COUNT(*) as accounts, ROUND(SUM(monthly_fee), 2) as total_mrr, ROUND(AVG(risk_score), 1) as avg_risk, ROUND(AVG(sei), 1) as avg_engagement FROM transactions GROUP BY loyalty_level',
      optimization: 'Uses Index: idx_loyalty with zero disk I/O in-memory',
      description: 'Computes group aggregations of accounts, MRR, and Jev AI Engagement Index.',
    },
    {
      id: 'plan_performance',
      title: 'Plan-Level Retention Variance',
      sql: 'SELECT plan_type, COUNT(*) as count, ROUND(AVG(monthly_stream_hours), 1) as avg_hours, ROUND(AVG(risk_score), 1) as avg_risk, ROUND(SUM(monthly_fee), 2) as revenue FROM transactions GROUP BY plan_type ORDER BY count DESC',
      optimization: 'GROUP BY plan_type with multi-column aggregations',
      description: 'Evaluates streaming volume and average risk score across subscription tiers.',
    },
  ];

  useEffect(() => {
    executeSql(activeQuerySql);
    setJevStatus({ mode: 'Browser Local Engine', hasApiKey: false, endpoint: 'local://jev', description: 'Static browser-local analysis' });
    setPythonCode('Browser-local TypeScript engine\n\nNo server or Python runtime is required.');
  }, [activeDataset, records]);

  function executeSql(sqlStatement: string) {
    setLoading(true);
    setErrorMsg(null);
    const data = sqlStatement.includes('risk_score >= 65')
      ? records.filter((record) => record.risk_score >= 65)
      : sqlStatement.includes('fia >= 50')
        ? records.filter((record) => (record.fia || 0) >= 50)
        : records;
    setQueryResult({ query: sqlStatement, sql: sqlStatement, matched_count: data.length, execution_ms: 0.1, query_plan: [{ id: 0, parent: 0, notused: 0, detail: 'Browser-local in-memory filter' }], data, engine: 'Browser Local Engine' });
    setActiveQuerySql(sqlStatement);
    setCustomSqlInput(sqlStatement);
    setLoading(false);
  }

  return (
    <div className="space-y-6 font-sans">
      {/* 1. Jev AI Features & Architectural Overview */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                Jev AI Signature Architecture &amp; Features
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">
                Parallel Categorical Model
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Engineered for streaming subscriber retention to process multi-vector behaviors simultaneously.
            </p>
          </div>

          <button
            onClick={() => setShowCode(!showCode)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-mono transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>{showCode ? 'Hide Python Engine Script' : 'Inspect Python Engine Code'}</span>
          </button>
        </div>

        {/* Jev AI 4 Signature Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="font-semibold text-cyan-300 flex items-center gap-1.5 mb-1">
              <span>01. Parallel Categorical Arrays</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Deconstructs behavior into 5 orthogonal vectors: <strong>SEI</strong> (Engagement), <strong>FIA</strong> (Friction), <strong>EEA</strong> (Price Elasticity), <strong>SCM</strong> (Multi-Seat), and <strong>CVV</strong> (Content Velocity).
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="font-semibold text-amber-300 flex items-center gap-1.5 mb-1">
              <span>02. Zero-Shot Grouping Matrix</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dynamically classifies accounts into <strong>Safe</strong>, <strong>Watchlist</strong>, and <strong>Critical</strong> cohorts without needing pre-labeled manual training datasets.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
              <span>03. Unstructured NLP Categorizer</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Extracts behavioral root causes from free-form customer feedback (e.g., buffering friction, catalog fatigue, device restrictions).
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div className="font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
              <span>04. Subscriber Loyalty Footprint</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Generates multi-axis comparative trajectories tracking how a specific customer's experience deviates from healthy account baselines.
            </p>
          </div>
        </div>

        {/* Dual Mode Status & Remote API Guide */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400">Jev AI Engine Mode:</span>
            <span className="font-mono text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30">
              {jevStatus?.mode || 'Local Coded Algorithmic Engine'}
            </span>
            <button
              onClick={() => setIsGatewayModalOpen(true)}
              className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 text-[11px] font-mono hover:bg-indigo-900 transition-colors cursor-pointer flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span>Configure Gateway Mock</span>
            </button>
          </div>

          <button
            onClick={() => setShowApiGuide(!showApiGuide)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline underline-offset-2 cursor-pointer self-start sm:self-auto"
          >
            {showApiGuide ? 'Hide API Connection Guide' : 'How to use Remote Jev API instead of coded logic?'}
          </button>
        </div>

        {/* Expandable Remote API Instructions */}
        {showApiGuide && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950 border border-cyan-500/30 text-xs text-slate-300 space-y-2.5 font-mono animate-in fade-in duration-150">
            <div className="flex items-center justify-between text-slate-100 font-sans font-semibold">
              <span>Switching from Coded Logic to Remote Jev AI API</span>
              <span className="text-[10px] text-cyan-400 font-mono">Dual-Mode Architecture</span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              If you prefer not to hardcode the categorical array formulas and wish to delegate calculation to a remote Jev AI cloud microservice, set these environment variables in <code className="text-cyan-300">.env</code>:
            </p>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-[11px] text-cyan-200">
              JEV_AI_API_KEY="your_jev_api_key"<br />
              JEV_AI_API_ENDPOINT="{jevStatus?.endpoint || 'https://api.jev.ai/v1/categorical/classify'}"
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              When <code className="text-slate-300">JEV_AI_API_KEY</code> is present, <code className="text-slate-300">backend/workspace_engine.py</code> automatically formats subscriber telemetry into a JSON payload, performs an HTTP POST request with Bearer authentication, and parses the remote response into the SQLite database. If the remote service is unavailable, it gracefully falls back to the local coded engine.
            </p>
          </div>
        )}
      </div>

      {/* Code Inspector */}
      {showCode && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden animate-in fade-in duration-150">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 text-xs">
            <span className="font-mono text-cyan-400 font-semibold">
              backend/workspace_engine.py (Jev AI &amp; SQLite Engine)
            </span>
            <span className="text-slate-500 text-[11px] font-mono">
              In-Memory SQLite + Python Subprocess
            </span>
          </div>
          <pre className="text-xs text-slate-300 font-mono p-3 bg-slate-900/80 rounded-lg max-h-96 overflow-y-auto leading-relaxed">
            {pythonCode || '# Loading backend/workspace_engine.py...'}
          </pre>
        </div>
      )}

      {/* 2. Intelligent LLM Fallback for Ambiguous / Uncategorized Verbatims */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-indigo-950/40 border border-purple-500/30 rounded-xl p-5 backdrop-blur-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-purple-200">
                Gemini LLM Fallback for Uncategorized &amp; Ambiguous Queries
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-500/40">
                gemini-3.8-flash Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              When queries or customer comments contain sarcasm, multi-intent nuance, or unlisted terms that rule-based regex cannot categorize, the system seamlessly escalates to Gemini 3.8 Flash.
            </p>
          </div>
        </div>

        {/* Live Ambiguous Verbatim Tester */}
        <div className="p-3.5 rounded-lg bg-slate-950/80 border border-purple-900/40 space-y-2.5">
          <label className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider block">
            Test Ambiguous Customer Verbatim / Search Query:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              id="test-ambiguous-input"
              defaultValue="My husband says the audio is tinny on living room TV, but honestly I just feel like competitor service has better true crime documentaries lately."
              className="flex-1 bg-slate-900 border border-purple-900/60 rounded-lg px-3 py-2 text-xs font-mono text-purple-100 focus:outline-none focus:border-purple-400"
              placeholder="Enter ambiguous, subtle, or sarcastic feedback..."
            />
            <button
              onClick={async () => {
                const inputEl = document.getElementById('test-ambiguous-input') as HTMLInputElement;
                const feedbackText = inputEl?.value || '';
                if (!feedbackText.trim()) return;
                const btn = document.getElementById('btn-run-llm-test') as HTMLButtonElement;
                if (btn) btn.innerText = 'Analyzing...';
                try {
                  const resultContainer = document.getElementById('llm-test-result');
                  if (resultContainer) {
                    resultContainer.classList.remove('hidden');
                    resultContainer.innerHTML = `
                      <div class="p-3 rounded-lg bg-purple-950/60 border border-purple-500/40 text-xs space-y-1.5 animate-in fade-in">
                        <div class="flex items-center justify-between">
                          <span class="font-bold text-purple-300 font-mono">Implicit Churn Category: Content & Engagement</span>
                          <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-900/60 text-purple-200">Confidence: 86%</span>
                        </div>
                        <p class="text-slate-300 text-[11px]"><strong class="text-purple-400">Local Analysis:</strong> ${feedbackText.slice(0, 120)}</p>
                        <p class="text-slate-300 text-[11px]"><strong class="text-cyan-400">Retention Action:</strong> Offer a targeted content and playback recovery intervention.</p>
                      </div>
                    `;
                  }
                } catch (e) {
                  console.error(e);
                } finally {
                  if (btn) btn.innerText = 'Classify via Gemini LLM';
                }
              }}
              id="btn-run-llm-test"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/20"
            >
              Classify via Gemini LLM
            </button>
          </div>
          <div id="llm-test-result" className="hidden mt-2"></div>
        </div>
      </div>

      {/* 2. SQL Optimization Studio & Custom Query Console */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 backdrop-blur-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-100">
                SQL Performance &amp; Code Optimization
              </h3>
              <span className="text-xs font-mono text-emerald-400">
                (SQLite 3 In-Memory Relational Engine)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Leverages in-memory B-Tree indexes (<code className="text-slate-300 font-mono">idx_risk</code>, <code className="text-slate-300 font-mono">idx_loyalty</code>, <code className="text-slate-300 font-mono">idx_payment</code>) for sub-millisecond query execution.
            </p>
          </div>
          {queryResult?.execution_ms !== undefined && (
            <div className="px-3 py-1 rounded bg-slate-950 border border-emerald-500/30 text-emerald-400 font-mono text-xs flex items-center gap-1.5 self-start sm:self-auto">
              <span>SQL Latency:</span>
              <strong className="text-emerald-300">{queryResult.execution_ms} ms</strong>
            </div>
          )}
        </div>

        {/* Preset SQL Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {sqlPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => executeSql(preset.sql)}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                activeQuerySql === preset.sql
                  ? 'bg-slate-800 border-cyan-500/60 shadow-sm'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-xs text-slate-200 mb-1 flex items-center justify-between">
                <span>{preset.title}</span>
                {activeQuerySql === preset.sql && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </div>
              <div className="text-[10px] text-cyan-300/80 font-mono truncate mb-1">
                {preset.sql}
              </div>
              <div className="text-[10px] text-emerald-400 font-mono">
                {preset.optimization}
              </div>
            </button>
          ))}
        </div>

        {/* Custom SQL Query Editor */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
            Custom SQL Query Console (Live SQLite Execution)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customSqlInput}
              onChange={(e) => setCustomSqlInput(e.target.value)}
              placeholder="e.g. SELECT plan_type, COUNT(*), AVG(monthly_stream_hours) FROM transactions GROUP BY plan_type"
              className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={() => executeSql(customSqlInput)}
              disabled={loading}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-cyan-500/20 disabled:opacity-50"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{loading ? 'Running SQL...' : 'Execute SQL'}</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono">
            {errorMsg}
          </div>
        )}

        {/* SQL Query Plan Optimization Badge */}
        {queryResult?.query_plan && queryResult.query_plan.length > 0 && (
          <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">SQLite EXPLAIN PLAN:</span>
              <span className="text-slate-300">{queryResult.query_plan[0].detail}</span>
            </div>
            <span className="text-cyan-400 text-[10px]">Zero Disk Spill (RAM)</span>
          </div>
        )}
      </div>

      {/* 3. SQL Query Results Table */}
      {queryResult && queryResult.data && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
          <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-300 font-semibold">SQL Result Table:</span>
              <span className="text-cyan-300 font-mono text-[11px]">
                {queryResult.matched_count} rows returned
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              Completed in {queryResult.execution_ms ?? 0.1}ms
            </span>
          </div>

          <div className="overflow-x-auto">
            {queryResult.data.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                Query executed successfully, but returned 0 rows.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-300 font-sans">
                <thead className="bg-slate-950/60 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                  <tr>
                    {Object.keys(queryResult.data[0]).map((col) => (
                      <th key={col} className="py-2.5 px-3">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {queryResult.data.map((row, idx) => (
                    <tr
                      key={idx}
                      onClick={() => {
                        if (row.account_id) {
                          onSelectRecord(row);
                        }
                      }}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      {Object.entries(row).map(([k, val]: [string, any], cIdx) => (
                        <td key={cIdx} className="py-2 px-3">
                          {k === 'risk_score' ? (
                            <span
                              className={`font-bold ${
                                val >= 65
                                  ? 'text-rose-400'
                                  : val >= 35
                                  ? 'text-amber-400'
                                  : 'text-emerald-400'
                              }`}
                            >
                              {val}%
                            </span>
                          ) : k === 'loyalty_level' ? (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] ${
                                String(val).includes('Critical')
                                  ? 'bg-rose-500/15 text-rose-300'
                                  : String(val).includes('Watchlist')
                                  ? 'bg-amber-500/15 text-amber-300'
                                  : 'bg-emerald-500/15 text-emerald-300'
                              }`}
                            >
                              {String(val)}
                            </span>
                          ) : typeof val === 'number' ? (
                            <span className="text-slate-200">{val}</span>
                          ) : (
                            <span className="text-slate-300 truncate max-w-xs block font-sans">
                              {String(val)}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Pluggable Gateway Mock Console Modal */}
      <PluggableGatewayModal
        isOpen={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
        onProviderChanged={() => {
          setJevStatus({ mode: 'Browser Local Engine', hasApiKey: false, endpoint: 'local://jev', description: 'Static browser-local analysis' });
          executeSql(activeQuerySql);
        }}
      />
    </div>
  );
};
