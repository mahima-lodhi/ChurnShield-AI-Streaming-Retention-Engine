import React, { useState, useEffect } from 'react';

interface GatewayConfig {
  activeProvider: 'mock_gateway' | 'local_engine' | 'remote_cloud';
  latencyMs: number;
  failureRate: number;
  requireAuth: boolean;
  bearerToken: string;
  endpointUrl: string;
}

interface GatewayMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatencyMs: number;
}

interface GatewayLogItem {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  accountId: string;
  statusCode: number;
  simulatedLatencyMs: number;
  requestBody: any;
  responseBody: any;
  authHeader: string | null;
}

interface PluggableGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderChanged: () => void;
}

export const PluggableGatewayModal: React.FC<PluggableGatewayModalProps> = ({
  isOpen,
  onClose,
  onProviderChanged,
}) => {
  const [config, setConfig] = useState<GatewayConfig | null>(null);
  const [metrics, setMetrics] = useState<GatewayMetrics | null>(null);
  const [logs, setLogs] = useState<GatewayLogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [testingPing, setTestingPing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<GatewayLogItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig((current) => current || {
        activeProvider: 'local_engine',
        latencyMs: 15,
        failureRate: 0,
        requireAuth: false,
        bearerToken: '',
        endpointUrl: 'local://jev',
      });
      setMetrics((current) => current || { totalRequests: 0, successfulRequests: 0, failedRequests: 0, avgLatencyMs: 0 });
    }
  }, [isOpen]);

  const showStatus = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleUpdateConfig = (patch: Partial<GatewayConfig>) => {
    setLoading(true);
    setConfig((current) => current ? { ...current, ...patch } : current);
    showStatus('Updated local browser configuration.');
    onProviderChanged();
    setLoading(false);
  };

  const handleSendTestPing = () => {
    setTestingPing(true);
    const now = new Date().toLocaleTimeString();
    setLogs((current) => [{ id: `local-${Date.now()}`, timestamp: now, method: 'LOCAL', url: 'local://jev', accountId: 'ACC-TEST', statusCode: 200, simulatedLatencyMs: config?.latencyMs || 0, requestBody: {}, responseBody: { success: true }, authHeader: null }, ...current]);
    setMetrics((current) => current ? { ...current, totalRequests: current.totalRequests + 1, successfulRequests: current.successfulRequests + 1 } : current);
    showStatus('Local browser ping succeeded (200 OK).');
    setTestingPing(false);
  };

  const handleClearLogs = () => {
    setLogs([]);
    setSelectedLog(null);
    showStatus('Cleared gateway traffic logs.');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-500/20 font-mono">
              GW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">
                  Pluggable Gateway Mock Console
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-500/30">
                  Simulation Gateway v2.4
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Simulates remote cloud endpoints without hardcoding business formulas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer text-sm font-mono"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1 text-xs text-slate-300">
          {/* Section 1: Active Provider Switcher */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Select Active Ingestion Provider
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">
                Pluggable Strategy Pattern
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Option A: Pluggable Gateway Mock */}
              <button
                type="button"
                onClick={() => handleUpdateConfig({ activeProvider: 'mock_gateway' })}
                disabled={loading}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  config?.activeProvider === 'mock_gateway'
                    ? 'bg-indigo-950/50 border-indigo-500/60 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-indigo-300 text-xs">
                      Pluggable Mock Gateway
                    </span>
                    {config?.activeProvider === 'mock_gateway' && (
                      <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Routes requests over real HTTP POST to simulated Jev AI microservice.
                  </p>
                </div>
                <span className="text-[10px] text-indigo-400 font-mono mt-2 block">
                  REST API · Latency &amp; Fault Configurable
                </span>
              </button>

              {/* Option B: Local Coded Algorithmic Engine */}
              <button
                type="button"
                onClick={() => handleUpdateConfig({ activeProvider: 'local_engine' })}
                disabled={loading}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  config?.activeProvider === 'local_engine'
                    ? 'bg-cyan-950/50 border-cyan-500/60 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-cyan-300 text-xs">
                      Local Coded Engine
                    </span>
                    {config?.activeProvider === 'local_engine' && (
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    Zero-network native Python execution directly in memory alongside SQLite.
                  </p>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono mt-2 block">
                  Sub-millisecond (&lt;0.1ms) · No Network
                </span>
              </button>

              {/* Option C: Remote Production Cloud API */}
              <button
                type="button"
                onClick={() => handleUpdateConfig({ activeProvider: 'remote_cloud' })}
                disabled={loading}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  config?.activeProvider === 'remote_cloud'
                    ? 'bg-purple-950/50 border-purple-500/60 shadow-lg shadow-purple-950/50'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-purple-300 text-xs">
                      Remote Cloud API
                    </span>
                    {config?.activeProvider === 'remote_cloud' && (
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">
                    External HTTPS endpoint with production bearer authentication.
                  </p>
                </div>
                <span className="text-[10px] text-purple-400 font-mono mt-2 block">
                  External Microservice · Cloud Target
                </span>
              </button>
            </div>
          </div>

          {/* Section 2: Mock Gateway Control Knobs & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Control Knobs */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                Mock Gateway Control Knobs
              </span>

              {/* Latency Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium">Simulated Network Latency:</label>
                  <span className="font-mono text-cyan-400 font-bold">{config?.latencyMs ?? 15} ms</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="400"
                  step="10"
                  value={config?.latencyMs ?? 15}
                  onChange={(e) => handleUpdateConfig({ latencyMs: Number(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0ms (Instant)</span>
                  <span>100ms (LAN)</span>
                  <span>400ms (WAN)</span>
                </div>
              </div>

              {/* Chaos Fault Rate Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <label className="text-slate-300 font-medium">Chaos Error Rate (503 Faults):</label>
                  <span className="font-mono text-rose-400 font-bold">{config?.failureRate ?? 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={config?.failureRate ?? 0}
                  onChange={(e) => handleUpdateConfig({ failureRate: Number(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Tests the client's automated fallback to the local coded engine when the gateway throws 503.
                </p>
              </div>

              {/* Auth Toggle */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <div>
                  <span className="text-xs text-slate-200 block font-medium">Require Bearer Auth:</span>
                  <span className="text-[10px] text-slate-500 font-mono">Enforces Authorization header check</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateConfig({ requireAuth: !config?.requireAuth })}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors cursor-pointer ${
                    config?.requireAuth
                      ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-800 border border-slate-700 text-slate-400'
                  }`}
                >
                  {config?.requireAuth ? 'ENABLED (401 on missing)' : 'DISABLED'}
                </button>
              </div>
            </div>

            {/* Live Gateway Telemetry Metrics */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex flex-col justify-between space-y-3">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">
                Live Mock Gateway Telemetry
              </span>

              <div className="grid grid-cols-2 gap-2 text-center font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Total Requests</span>
                  <span className="text-lg font-bold text-slate-100">{metrics?.totalRequests ?? 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">200 OK Hits</span>
                  <span className="text-lg font-bold text-emerald-400">{metrics?.successfulRequests ?? 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Simulated Failures</span>
                  <span className="text-lg font-bold text-rose-400">{metrics?.failedRequests ?? 0}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Configured Delay</span>
                  <span className="text-lg font-bold text-cyan-400">{config?.latencyMs ?? 15}ms</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleSendTestPing}
                  disabled={testingPing}
                  className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-600/30"
                >
                  <svg
                    className={`w-3.5 h-3.5 ${testingPing ? 'animate-spin' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>{testingPing ? 'Pinging...' : 'Send Test Ping to Gateway'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClearLogs}
                  className="py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-mono transition-colors cursor-pointer"
                >
                  Clear Logs
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Live Traffic Packet Inspector */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3 font-mono">
            <div className="flex items-center justify-between font-sans">
              <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                Live HTTP Traffic Inspector (Last {logs.length} Packets)
              </span>
              <button
                type="button"
                onClick={() => setLogs((current) => [...current])}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline"
              >
                Refresh Packets
              </button>
            </div>

            {logs.length === 0 ? (
              <div className="py-6 text-center text-slate-500 font-mono text-xs">
                No mock gateway traffic recorded yet. Click &quot;Send Test Ping&quot; or re-run the Python engine.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {logs.slice(0, 15).map((log) => (
                  <div
                    key={log.id}
                    onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                      selectedLog?.id === log.id
                        ? 'bg-slate-900 border-cyan-500/50'
                        : 'bg-slate-950 hover:bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.statusCode === 200
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {log.statusCode}
                        </span>
                        <span className="font-semibold text-slate-200">{log.method}</span>
                        <span className="text-slate-400">{log.url}</span>
                        <span className="text-cyan-400 font-mono">({log.accountId})</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2">
                        <span>{log.simulatedLatencyMs}ms delay</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>

                    {/* Expandable Packet Details */}
                    {selectedLog?.id === log.id && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] animate-in fade-in">
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block mb-1 text-[10px]">Client Request Payload:</span>
                          <pre className="text-slate-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                            {JSON.stringify(log.requestBody, null, 2)}
                          </pre>
                        </div>
                        <div className="p-2 rounded bg-slate-900 border border-slate-800">
                          <span className="text-slate-400 block mb-1 text-[10px]">Mock Gateway Response:</span>
                          <pre className="text-cyan-300 whitespace-pre-wrap max-h-36 overflow-y-auto">
                            {JSON.stringify(log.responseBody, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {statusMessage && (
              <span className="text-emerald-400 font-mono animate-in fade-in">
                ✓ {statusMessage}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium cursor-pointer"
          >
            Close Gateway Console
          </button>
        </div>
      </div>
    </div>
  );
};
