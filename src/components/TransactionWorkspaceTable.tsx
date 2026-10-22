import React, { useState, useMemo } from 'react';
import { PythonTransactionRecord } from '../types';

interface TransactionWorkspaceTableProps {
  records: PythonTransactionRecord[];
  onSelectRecord: (record: PythonTransactionRecord) => void;
  activeLoyaltyFilter: string;
  onFilterChange: (filter: string) => void;
  onCleanData: () => void;
  isCleaning: boolean;
}

export const TransactionWorkspaceTable: React.FC<TransactionWorkspaceTableProps> = ({
  records,
  onSelectRecord,
  activeLoyaltyFilter,
  onFilterChange,
  onCleanData,
  isCleaning,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Filter categories extracted
  const categories = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => set.add(r.primary_category));
    return Array.from(set);
  }, [records]);

  // Filtering logic
  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (activeLoyaltyFilter !== 'all' && r.loyalty_level !== activeLoyaltyFilter) {
        return false;
      }
      if (categoryFilter !== 'all' && r.primary_category !== categoryFilter) {
        return false;
      }
      if (search.trim() !== '') {
        const q = search.toLowerCase();
        const matchesName = r.customer_name.toLowerCase().includes(q);
        const matchesId = r.account_id.toLowerCase().includes(q);
        const matchesPlan = r.plan_type.toLowerCase().includes(q);
        const matchesFeedback = r.unstructured_feedback.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesPlan && !matchesFeedback) {
          return false;
        }
      }
      return true;
    });
  }, [records, activeLoyaltyFilter, categoryFilter, search]);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search account, customer, plan, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 bg-slate-950/80 border border-slate-700 text-xs text-slate-100 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500 placeholder-slate-500"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Loyalty Level Filter Tabs */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-xs">
            {['all', 'High Loyalty (Safe)', 'Medium Risk (Watchlist)', 'High Risk (Critical)'].map((tab) => (
              <button
                key={tab}
                onClick={() => onFilterChange(tab)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer text-xs ${
                  activeLoyaltyFilter === tab
                    ? 'bg-slate-800 text-slate-100 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab === 'all' ? 'All Accounts' : tab.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer font-sans"
          >
            <option value="all">All Parsed Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Clean Data Action */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-mono">
            {filtered.length} of {records.length} records
          </span>
          <button
            onClick={onCleanData}
            disabled={isCleaning}
            className="px-3 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${isCleaning ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{isCleaning ? 'Cleaning via Python...' : 'Run Python Cleaning'}</span>
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-4">Account ID &amp; Customer</th>
              <th className="py-3 px-3">Plan &amp; Monthly Fee</th>
              <th className="py-3 px-3">Payment</th>
              <th className="py-3 px-3">Activity &amp; Stream Hours</th>
              <th className="py-3 px-3">Technical Friction</th>
              <th className="py-3 px-3">Python Parsed Category</th>
              <th className="py-3 px-3">Cancellation Risk</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                  No customer records matched the selected query filter.
                </td>
              </tr>
            ) : (
              filtered.map((r) => (
                <tr
                  key={r.account_id}
                  onClick={() => onSelectRecord(r)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-200">{r.customer_name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {r.account_id} · {r.tenure_months}m tenure
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="text-slate-200">{r.plan_type}</div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      ${r.monthly_fee}/mo
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        r.payment_status === 'Overdue'
                          ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/15 text-emerald-300'
                      }`}
                    >
                      {r.payment_status}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className="text-slate-200">{r.monthly_stream_hours} hrs/mo</div>
                    <div className="text-slate-400 text-[10px]">
                      {r.days_since_stream} days since stream
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-[11px]">
                    <div className={r.buffering_events >= 3 ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                      {r.buffering_events} buffering events
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      {r.support_tickets} tickets opened
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                        r.primary_category === 'Playback Friction'
                          ? 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                          : r.primary_category === 'Price Sensitivity'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-500/30'
                          : r.primary_category === 'Content Fatigue'
                          ? 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/30'
                          : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {r.primary_category}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold text-xs ${
                          r.risk_score >= 65
                            ? 'text-rose-400'
                            : r.risk_score >= 35
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {r.risk_score}%
                      </span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        {r.loyalty_level.split(' ')[0]}
                      </span>
                    </div>
                    <div className="w-20 bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                      <div
                        className={`h-full ${
                          r.risk_score >= 65
                            ? 'bg-rose-500'
                            : r.risk_score >= 35
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${r.risk_score}%` }}
                      />
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectRecord(r);
                      }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-medium cursor-pointer transition-colors"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
