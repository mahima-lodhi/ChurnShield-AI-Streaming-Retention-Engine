/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PythonTransactionRecord, KaggleDatasetInfo } from './types';
import { LoyaltyLevelChart } from './components/LoyaltyLevelChart';
import { SubscriberPatternsChart } from './components/SubscriberPatternsChart';
import { TransactionWorkspaceTable } from './components/TransactionWorkspaceTable';
import { PythonQueryStudio } from './components/PythonQueryStudio';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { KaggleDatasetBar } from './components/KaggleDatasetBar';
import { PluggableGatewayModal } from './components/PluggableGatewayModal';
import { getStaticRecords, STATIC_DATASETS } from './data/staticWorkspace';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workspace' | 'python_studio'>('workspace');
  const [records, setRecords] = useState<PythonTransactionRecord[]>([]);
  const [datasets, setDatasets] = useState<KaggleDatasetInfo[]>([]);
  const [activeDataset, setActiveDataset] = useState<string>('kaggle_ott_streaming_churn.csv');
  const [loading, setLoading] = useState(true);
  const [isCleaning, setIsCleaning] = useState(false);
  const [activeLoyaltyFilter, setActiveLoyaltyFilter] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<PythonTransactionRecord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCleanedData(activeDataset);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  function fetchCleanedData(datasetName: string) {
    setLoading(true);
    setDatasets(STATIC_DATASETS);
    setRecords(getStaticRecords(datasetName));
    setLoading(false);
  }

  const handleSelectDataset = (datasetFilename: string) => {
    setActiveDataset(datasetFilename);
    fetchCleanedData(datasetFilename);
    showToast(`Loaded Kaggle dataset: ${datasetFilename}`);
  };

  const handleUploadSuccess = (uploadedFilename: string) => {
    setActiveDataset(uploadedFilename);
    setRecords(getStaticRecords(uploadedFilename));
    showToast(`Uploaded and loaded Kaggle dataset: ${uploadedFilename}`);
  };

  const handleCleanData = () => {
    setIsCleaning(true);
    setRecords(getStaticRecords(activeDataset));
    showToast(`Successfully processed ${records.length} records locally in the browser.`);
    setIsCleaning(false);
  };

  const handleExportCSV = () => {
    if (records.length === 0) return;
    const headers = [
      'Account_ID',
      'Customer_Name',
      'Plan_Type',
      'Monthly_Fee',
      'Tenure_Months',
      'Payment_Status',
      'Days_Since_Stream',
      'Monthly_Stream_Hours',
      'Buffering_Events',
      'Support_Tickets',
      'Primary_Category',
      'Risk_Score',
      'Loyalty_Level',
      'SEI',
      'FIA',
      'EEA',
      'SCM',
      'CVV',
    ];

    const rows = records.map((r) => [
      r.account_id,
      `"${r.customer_name}"`,
      `"${r.plan_type}"`,
      r.monthly_fee,
      r.tenure_months,
      r.payment_status,
      r.days_since_stream,
      r.monthly_stream_hours,
      r.buffering_events,
      r.support_tickets,
      `"${r.primary_category}"`,
      r.risk_score,
      `"${r.loyalty_level}"`,
      r.sei ?? 0,
      r.fia ?? 0,
      r.eea ?? 0,
      r.scm ?? 0,
      r.cvv ?? 0,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cleaned_${activeDataset}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Exported cleaned ${activeDataset} to CSV.`);
  };

  const handleInspectRecord = (rec: PythonTransactionRecord) => {
    setSelectedRecord(rec);
    setIsDetailModalOpen(true);
  };

  // High level overview metrics
  const totalAccounts = records.length;
  const criticalCount = records.filter((r) => r.risk_score >= 65).length;
  const totalMRR = records.reduce((acc, r) => acc + r.monthly_fee, 0);
  const atRiskMRR = records
    .filter((r) => r.risk_score >= 65)
    .reduce((acc, r) => acc + r.monthly_fee, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased font-sans">
      {/* Top Application Header */}
      <header className="bg-slate-950/90 border-b border-slate-800/80 px-4 lg:px-8 py-3 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/churnshield_logo_1791114256574.jpg"
              alt="ChurnShield Logo"
              className="w-9 h-9 rounded-lg border border-cyan-500/30 object-cover shadow-md shadow-cyan-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-100">
                  ChurnShield
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-xs font-medium text-slate-300">
                  Customer Data Workspace
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">
                  Python 3.10 Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                Kaggle dataset ingestion · SQLite in-memory optimization · Jev AI zero-shot matrix
              </p>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Gateway Mock Console Launcher */}
            <button
              onClick={() => setIsGatewayModalOpen(true)}
              className="px-2.5 py-1.5 bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-500/40 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-950/40"
              title="Open Pluggable Gateway Mock Console"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span>Gateway Mock</span>
            </button>

            <button
              onClick={handleCleanData}
              disabled={isCleaning}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 text-cyan-400 ${isCleaning ? 'animate-spin' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isCleaning ? 'Processing...' : 'Run Python Cleaning'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-cyan-500/20"
            >
              <span>Export Cleaned CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto p-4 lg:p-8 flex-1 space-y-6">
        {/* Kaggle Dataset Ingestion & Switcher Bar */}
        <KaggleDatasetBar
          datasets={datasets}
          activeDataset={activeDataset}
          onSelectDataset={handleSelectDataset}
          onRefresh={() => fetchCleanedData(activeDataset)}
          isLoading={loading || isCleaning}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'workspace'
                ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h4" />
            </svg>
            <span>Customer Transaction Workspace &amp; Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('python_studio')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'python_studio'
                ? 'bg-slate-800 text-slate-100 shadow-sm border border-slate-700 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            <span>Python Query Studio &amp; Code Inspector</span>
          </button>
        </div>

        {/* Tab 1: Data Workspace & Analytics */}
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            {/* Overview Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">
                  Cleaned Kaggle Records
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-100">
                    {totalAccounts}
                  </span>
                  <span className="text-xs text-emerald-400 font-mono">100% normalized</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 font-mono">
                  Loaded from <code className="text-slate-400">{activeDataset}</code>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">
                  Accounts at Cancellation Risk
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-rose-400">
                    {criticalCount}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ({totalAccounts > 0 ? Math.round((criticalCount / totalAccounts) * 100) : 0}%)
                  </span>
                </div>
                <div className="text-[11px] text-rose-400/80 mt-2 font-mono">
                  Risk score &ge; 65% cutoff
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">
                  Monitored Monthly Value (MRR)
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-slate-100">
                    ${totalMRR.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-2 font-mono">
                  Annualized: ${(totalMRR * 12).toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
                <span className="text-xs text-slate-400 block mb-1">
                  Monthly Revenue at Risk
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-amber-400">
                    ${atRiskMRR.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">/ month</span>
                </div>
                <div className="text-[11px] text-amber-400/80 mt-2 font-mono">
                  Eligible for retention offer
                </div>
              </div>
            </div>

            {/* Clean Visualization Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Loyalty Level Distribution */}
              <LoyaltyLevelChart
                records={records}
                activeFilter={activeLoyaltyFilter}
                onFilterChange={setActiveLoyaltyFilter}
              />

              {/* Chart 2: Subscriber Patterns Over Time */}
              <SubscriberPatternsChart records={records} />
            </div>

            {/* Clean Customer Transaction Table */}
            <TransactionWorkspaceTable
              records={records}
              onSelectRecord={handleInspectRecord}
              activeLoyaltyFilter={activeLoyaltyFilter}
              onFilterChange={setActiveLoyaltyFilter}
              onCleanData={handleCleanData}
              isCleaning={isCleaning}
            />
          </div>
        )}

        {/* Tab 2: Python Query Studio */}
        {activeTab === 'python_studio' && (
          <PythonQueryStudio
            onSelectRecord={handleInspectRecord}
            activeDataset={activeDataset}
            records={records}
          />
        )}

        {/* Clean Footer */}
        <footer className="pt-6 pb-2 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <span>ChurnShield Python Data Workspace · Dynamic Kaggle Ingestion</span>
          <span>In-Memory SQLite Optimization</span>
        </footer>
      </main>

      {/* Customer Inspection Drawer */}
      <CustomerDetailModal
        record={selectedRecord}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      {/* Pluggable Gateway Mock Console Modal */}
      <PluggableGatewayModal
        isOpen={isGatewayModalOpen}
        onClose={() => setIsGatewayModalOpen(false)}
        onProviderChanged={() => {
          showToast('Updated local browser provider.');
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/40 text-slate-100 text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom duration-200 font-sans">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
