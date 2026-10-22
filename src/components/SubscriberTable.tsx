import React, { useState, useMemo } from 'react';
import { SubscriberRecord, RiskTier } from '../types';

interface SubscriberTableProps {
  subscribers: SubscriberRecord[];
  selectedSubscriber: SubscriberRecord | null;
  onSelectSubscriber: (subscriber: SubscriberRecord) => void;
  onOpenPlaybook: (subscriber: SubscriberRecord) => void;
  onDispatchConcession: (subscriberId: string) => void;
  selectedIds: string[];
  onToggleSelect: (subscriberId: string) => void;
  onSelectAll: (ids: string[]) => void;
}

type SortField = 'name' | 'mrr' | 'tenureMonths' | 'riskScore' | 'monthlyHoursStreamed' | 'bufferingIncidents';
type SortOrder = 'asc' | 'desc';

export const SubscriberTable: React.FC<SubscriberTableProps> = ({
  subscribers,
  selectedSubscriber,
  onSelectSubscriber,
  onOpenPlaybook,
  onDispatchConcession,
  selectedIds,
  onToggleSelect,
  onSelectAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('riskScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter & Search Logic
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      // Risk Tier filter
      if (filterTier !== 'all' && sub.riskTier !== filterTier) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = sub.name.toLowerCase().includes(q);
        const matchesId = sub.id.toLowerCase().includes(q);
        const matchesPlan = sub.plan.toLowerCase().includes(q);
        const matchesFactor = sub.primaryRiskFactor.toLowerCase().includes(q);
        const matchesNotes = sub.unstructuredNotes.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !matchesPlan && !matchesFactor && !matchesNotes) {
          return false;
        }
      }
      return true;
    });
  }, [subscribers, filterTier, searchQuery]);

  // Sort Logic
  const sortedSubscribers = useMemo(() => {
    return [...filteredSubscribers].sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredSubscribers, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const allFilteredSelected =
    sortedSubscribers.length > 0 &&
    sortedSubscribers.every((s) => selectedIds.includes(s.id));

  const toggleSelectAllFiltered = () => {
    if (allFilteredSelected) {
      onSelectAll([]);
    } else {
      onSelectAll(sortedSubscribers.map((s) => s.id));
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm">
      {/* Table Controls Header */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ID, subscriber, plan, or ticket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-72 bg-slate-950/80 border border-slate-700/80 text-xs text-slate-100 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-cyan-500 placeholder-slate-500 font-sans"
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

          {/* Segmented Filter Buttons */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5 text-xs font-medium">
            {[
              { id: 'all', label: 'All Subscribers', count: subscribers.length },
              { id: 'Critical', label: 'Critical', count: subscribers.filter((s) => s.riskTier === 'Critical').length },
              { id: 'Moderate', label: 'Moderate', count: subscribers.filter((s) => s.riskTier === 'Moderate').length },
              { id: 'Retained', label: 'Retained', count: subscribers.filter((s) => s.riskTier === 'Retained').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterTier(tab.id)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterTier === tab.id
                    ? 'bg-slate-800 text-slate-100 shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className="font-mono text-[10px] text-slate-400">({tab.count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          {selectedIds.length > 0 && (
            <span className="text-cyan-400 font-mono font-medium">
              {selectedIds.length} selected
            </span>
          )}
          <span className="text-slate-400">·</span>
          <span className="font-mono">
            Showing {sortedSubscribers.length} of {subscribers.length} records
          </span>
        </div>
      </div>

      {/* Table Element */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="py-3 px-3 w-8">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAllFiltered}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
              </th>
              <th
                onClick={() => handleSort('name')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 select-none"
              >
                Subscriber / ID {sortField === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th
                onClick={() => handleSort('riskScore')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 select-none"
              >
                Churn Risk Propensity {sortField === 'riskScore' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th
                onClick={() => handleSort('mrr')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 select-none"
              >
                Plan / MRR {sortField === 'mrr' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th
                onClick={() => handleSort('monthlyHoursStreamed')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 select-none"
              >
                Streaming Volume {sortField === 'monthlyHoursStreamed' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th
                onClick={() => handleSort('bufferingIncidents')}
                className="py-3 px-3 cursor-pointer hover:text-slate-200 select-none"
              >
                Friction Rate {sortField === 'bufferingIncidents' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </th>
              <th className="py-3 px-3">
                Unstructured Behavioral Diagnosis
              </th>
              <th className="py-3 px-3 text-right">
                Retention Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {sortedSubscribers.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                  No subscribers match the current filter or search parameters.
                </td>
              </tr>
            ) : (
              sortedSubscribers.map((sub) => {
                const isSelected = selectedSubscriber?.id === sub.id;
                const isChecked = selectedIds.includes(sub.id);

                return (
                  <tr
                    key={sub.id}
                    onClick={() => onSelectSubscriber(sub)}
                    className={`transition-colors cursor-pointer hover:bg-slate-800/40 ${
                      isSelected ? 'bg-cyan-950/25 border-l-2 border-l-cyan-400' : ''
                    }`}
                  >
                    <td
                      className="py-3 px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSelect(sub.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => onToggleSelect(sub.id)}
                        className="rounded border-slate-700 bg-slate-800 text-cyan-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-200 flex items-center gap-2">
                        <span>{sub.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1.5">
                        <span>{sub.id}</span>
                        <span>·</span>
                        <span>{sub.tenureMonths}m tenure</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold text-xs tabular-nums ${
                            sub.riskTier === 'Critical'
                              ? 'text-rose-400'
                              : sub.riskTier === 'Moderate'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {(sub.riskScore * 100).toFixed(0)}%
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-medium ${
                            sub.riskTier === 'Critical'
                              ? 'bg-rose-500/15 text-rose-300'
                              : sub.riskTier === 'Moderate'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-emerald-500/15 text-emerald-300'
                          }`}
                        >
                          {sub.riskTier}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        SEI: {sub.parallelArray.streamEngagementIndex} · FIA: {sub.parallelArray.frictionIncidentArray}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-200">{sub.plan}</div>
                      <div className="text-[11px] text-slate-400 font-mono tabular-nums">
                        ${sub.mrr}/mo
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div className="text-slate-200 tabular-nums">
                        {sub.monthlyHoursStreamed} hrs/mo
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {(sub.completionRate * 100).toFixed(0)}% completion
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      <div
                        className={
                          sub.bufferingIncidents > 4
                            ? 'text-rose-400 font-semibold'
                            : sub.bufferingIncidents > 2
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {sub.bufferingIncidents} buf/10h
                      </div>
                      <div className="text-slate-400 text-[10px]">
                        {sub.playbackCrashes} crashes · {sub.unresolvedTickets} tickets
                      </div>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="text-slate-200 text-xs truncate font-medium">
                        {sub.primaryRiskFactor}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5 italic">
                        "{sub.unstructuredNotes}"
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onOpenPlaybook(sub)}
                          className="px-2.5 py-1 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 rounded text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          Playbook
                        </button>
                        <button
                          onClick={() => onDispatchConcession(sub.id)}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer border ${
                            sub.retentionStatus === 'Offer Dispatched'
                              ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                          }`}
                        >
                          {sub.retentionStatus === 'Offer Dispatched' ? 'Shielded' : 'Dispatch'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
