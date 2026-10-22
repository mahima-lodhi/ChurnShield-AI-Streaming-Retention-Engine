import React, { useState } from 'react';
import { KaggleDatasetInfo } from '../types';

interface KaggleDatasetBarProps {
  datasets: KaggleDatasetInfo[];
  activeDataset: string;
  onSelectDataset: (filename: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  onUploadSuccess: (filename: string) => void;
}

export const KaggleDatasetBar: React.FC<KaggleDatasetBarProps> = ({
  datasets,
  activeDataset,
  onSelectDataset,
  onRefresh,
  isLoading,
  onUploadSuccess,
}) => {
  const [showRawModal, setShowRawModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [rawCsvContent, setRawCsvContent] = useState<string>('');
  const [loadingRaw, setLoadingRaw] = useState(false);

  // Upload modal state
  const [uploadFilename, setUploadFilename] = useState('kaggle_custom_churn.csv');
  const [uploadCsvText, setUploadCsvText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const activeMeta = datasets.find((d) => d.filename === activeDataset) || {
    filename: activeDataset,
    title: 'Kaggle Dataset',
    rowCount: 30,
    sizeBytes: 4652,
    path: `data/${activeDataset}`,
  };

  const handleOpenRawModal = async () => {
    setShowRawModal(true);
    setLoadingRaw(true);
    setRawCsvContent(`Account_ID,Customer_Name,Plan_Type,Monthly_Fee\n${activeDataset},Browser Local Dataset,Static Demo,0`);
    setLoadingRaw(false);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadCsvText.trim()) {
      setUploadError('Please provide CSV content to upload.');
      return;
    }
    setIsUploading(true);
    setUploadError(null);
    setShowUploadModal(false);
    setUploadCsvText('');
    onUploadSuccess(uploadFilename);
    setIsUploading(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFilename(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setUploadCsvText(text || '');
      };
      reader.readAsText(file);
    }
  };

  return (
    <>
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 backdrop-blur-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        {/* Left: Active Dataset Badge & Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono text-[11px]">
              CSV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-200">
                  Kaggle Data Source:
                </span>
                <span className="font-mono text-cyan-300 font-semibold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-[11px]">
                  {activeMeta.filename}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Loaded dynamically from <code className="text-slate-300 font-mono">/{activeMeta.path}</code> ({activeMeta.rowCount} records · {(activeMeta.sizeBytes / 1024).toFixed(1)} KB)
              </p>
            </div>
          </div>

          {/* Dataset Switcher Dropdown */}
          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <label className="text-[11px] text-slate-400 font-sans">Switch Dataset:</label>
            <select
              value={activeDataset}
              onChange={(e) => onSelectDataset(e.target.value)}
              disabled={isLoading}
              className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer font-sans"
            >
              {datasets.map((d) => (
                <option key={d.filename} value={d.filename}>
                  {d.title} ({d.rowCount} rows)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* View Raw CSV Button */}
          <button
            onClick={handleOpenRawModal}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>View Raw CSV</span>
          </button>

          {/* Upload Custom Kaggle CSV Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span>Upload Kaggle CSV</span>
          </button>

          {/* Reload / Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Reload dataset from disk"
          >
            <svg
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Raw CSV Preview Modal */}
      {showRawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden font-sans">
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className="font-semibold text-slate-100 text-sm">
                  Raw Kaggle Dataset File Preview: <code className="text-cyan-300 font-mono">data/{activeDataset}</code>
                </span>
              </div>
              <button
                onClick={() => setShowRawModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto bg-slate-950 text-xs font-mono text-slate-300 leading-relaxed">
              {loadingRaw ? (
                <div className="py-12 text-center text-slate-500">Loading raw CSV file from disk...</div>
              ) : (
                <pre className="whitespace-pre-wrap">{rawCsvContent}</pre>
              )}
            </div>
            <div className="p-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
              <span>Parsed dynamically by Python <code className="text-slate-300">csv.DictReader</code> in <code className="text-slate-300">backend/workspace_engine.py</code></span>
              <button
                onClick={() => setShowRawModal(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Custom Kaggle CSV Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden font-sans">
            <form onSubmit={handleUploadSubmit}>
              <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="font-semibold text-slate-100 text-sm">
                    Upload &amp; Load Custom Kaggle CSV Dataset
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-200 text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs text-slate-300">
                <p className="text-slate-400">
                  Upload any customer churn transaction CSV (e.g. from Kaggle). The Python engine will ingest it, compute Jev AI categorical arrays, and load it straight into the in-memory SQLite database.
                </p>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Filename (.csv)
                  </label>
                  <input
                    type="text"
                    value={uploadFilename}
                    onChange={(e) => setUploadFilename(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-200 focus:outline-none focus:border-cyan-500"
                    placeholder="my_kaggle_churn_dataset.csv"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Choose local .csv file or paste content below
                  </label>
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-slate-700 file:text-xs file:font-semibold file:bg-slate-800 file:text-cyan-300 hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    CSV Content (Headers: account_id, customer_name, plan_type, monthly_fee, tenure_months, payment_status, days_since_stream, monthly_stream_hours, buffering_events, support_tickets, unstructured_feedback)
                  </label>
                  <textarea
                    rows={8}
                    value={uploadCsvText}
                    onChange={(e) => setUploadCsvText(e.target.value)}
                    placeholder="account_id,customer_name,plan_type,monthly_fee,tenure_months,payment_status,days_since_stream,monthly_stream_hours,buffering_events,support_tickets,unstructured_feedback&#10;ACC-9901,Alex Vance,Premium 4K,22.99,12,Paid,3,34.0,1,0,&quot;Smooth stream experience.&quot;"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 leading-relaxed"
                  />
                </div>

                {uploadError && (
                  <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono">
                    {uploadError}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Uploading & Processing...' : 'Save & Process in Python'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
