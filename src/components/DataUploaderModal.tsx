import React, { useState } from 'react';
import { SubscriberRecord, ModelHyperparameters } from '../types';
import { parseUnstructuredText } from '../engine/unstructuredParser';
import {
  computeParallelCategoricalArray,
  calculateZeroShotRisk,
} from '../engine/jevModel';

interface DataUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCustomDataset: (records: SubscriberRecord[], datasetName: string) => void;
  hyperparameters: ModelHyperparameters;
}

export const DataUploaderModal: React.FC<DataUploaderModalProps> = ({
  isOpen,
  onClose,
  onImportCustomDataset,
  hyperparameters,
}) => {
  const [rawText, setRawText] = useState('');
  const [datasetName, setDatasetName] = useState('Custom-Kaggle-Churn-Ingest');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleCSV = `CustomerID,Name,Plan,MRR,TenureMonths,LastActiveDays,MonthlyHours,CompletionRate,BufferingIncidents,UnresolvedTickets,CustomerNotes
KAG-CUST-801,Danielle Reed,Premium 4K Ultra,22.99,7,16,5.2,0.28,6.8,2,"Constant 4K buffering and app crashes during live premiere. Ready to cancel."
KAG-CUST-802,Arjun Patel,Family Multi-Seat,24.99,28,2,44.0,0.85,0.4,0,"Everything runs super smoothly across all our 4 smart TV profiles."
KAG-CUST-803,Claire Dubois,Standard HD,15.49,12,11,9.0,0.41,3.4,1,"Subscription is becoming too expensive for the few movies I watch."
KAG-CUST-804,Tomas Gomez,Standard with Ads,9.99,4,19,4.1,0.22,4.2,1,"The ads keep freezing the stream on Firestick. Very frustrating."
KAG-CUST-805,Yuki Tanaka,Annual Pass,18.99,36,1,55.0,0.92,0.2,0,"Loving the new Japanese original anime releases and 4K quality."`;

  const handleLoadSample = () => {
    setRawText(sampleCSV);
    setDatasetName('Kaggle-Synthetic-Sample-Ingest');
    setError(null);
  };

  const handleProcess = () => {
    setError(null);
    if (!rawText.trim()) {
      setError('Please paste CSV or JSON data to ingest.');
      return;
    }

    try {
      const trimmed = rawText.trim();
      let parsedRows: any[] = [];

      // Check if JSON
      if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
        const json = JSON.parse(trimmed);
        parsedRows = Array.isArray(json) ? json : [json];
      } else {
        // Parse CSV
        const lines = trimmed.split('\n').filter((l) => l.trim().length > 0);
        if (lines.length < 2) {
          throw new Error('CSV must contain a header row and at least one data row.');
        }

        // Simple CSV splitter that respects quoted strings
        const parseLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseLine(lines[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

        for (let i = 1; i < lines.length; i++) {
          const cols = parseLine(lines[i]);
          if (cols.length < 2) continue;
          const rowObj: any = {};
          headers.forEach((h, idx) => {
            rowObj[h] = cols[idx] || '';
          });
          parsedRows.push(rowObj);
        }
      }

      if (parsedRows.length === 0) {
        throw new Error('No valid records parsed from input.');
      }

      // Convert to SubscriberRecord model
      const records: SubscriberRecord[] = parsedRows.map((r, idx) => {
        const id = r.customerid || r.id || `CUST-IMP-${1000 + idx}`;
        const name = r.name || r.customername || `Subscriber ${idx + 1}`;
        const plan = (r.plan || 'Standard HD') as any;
        const mrr = parseFloat(r.mrr || r.monthlycharges || r.price || '15.49') || 15.49;
        const tenureMonths = parseInt(r.tenuremonths || r.tenure || '12', 10) || 12;
        const lastActiveDays = parseInt(r.lastactivedays || r.inactivedays || '4', 10) || 4;
        const monthlyHoursStreamed = parseFloat(r.monthlyhours || r.streamhours || '20.0') || 20.0;
        const completionRate = parseFloat(r.completionrate || '0.65') || 0.65;
        const bufferingIncidents = parseFloat(r.bufferingincidents || r.buffering || '1.5') || 1.5;
        const playbackCrashes = parseInt(r.playbackcrashes || r.crashes || '0', 10) || 0;
        const unresolvedTickets = parseInt(r.unresolvedtickets || r.tickets || '0', 10) || 0;
        const unstructuredNotes = r.customernotes || r.notes || r.feedback || r.ticket || 'Standard streaming activity';

        const parsedBehavioralStates = parseUnstructuredText(unstructuredNotes);
        const parallelArray = computeParallelCategoricalArray(
          {
            id,
            name,
            email: `${name.toLowerCase().replace(/\s+/g, '.')}@imported.com`,
            plan,
            mrr,
            tenureMonths,
            lastActiveDays,
            monthlyHoursStreamed,
            completionRate,
            bufferingIncidents,
            playbackCrashes,
            unresolvedTickets,
            priceSensitivityScore: mrr > 20 ? 8 : 4,
            activeProfiles: plan.includes('Family') ? 4 : 2,
            contentCatalogBreadth: 60,
            newReleaseConsumption: 65,
            unstructuredNotes,
            avatarSeed: name,
            parsedBehavioralStates,
          },
          hyperparameters
        );

        const { riskScore, riskTier, primaryRiskFactor } = calculateZeroShotRisk(
          parallelArray,
          { tenureMonths, lastActiveDays },
          hyperparameters
        );

        return {
          id,
          name,
          email: `${name.toLowerCase().replace(/\s+/g, '.')}@imported.com`,
          avatarSeed: name,
          plan,
          mrr,
          tenureMonths,
          lastActiveDays,
          monthlyHoursStreamed,
          completionRate,
          bufferingIncidents,
          playbackCrashes,
          unresolvedTickets,
          priceSensitivityScore: mrr > 20 ? 8 : 4,
          activeProfiles: plan.includes('Family') ? 4 : 2,
          contentCatalogBreadth: 60,
          newReleaseConsumption: 65,
          unstructuredNotes,
          parsedBehavioralStates,
          parallelArray,
          riskScore,
          riskTier,
          primaryRiskFactor,
          retentionStatus: riskTier === 'Critical' ? 'Action Required' : 'Shielded',
        };
      });

      onImportCustomDataset(records, datasetName);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to parse database file. Check format.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden font-sans">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-100">
                Ingest Raw Kaggle Customer Database
              </h3>
              <p className="text-xs text-slate-400">
                Upload or paste unstructured CSV / JSON to parse into behavioral states
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
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-200 block">
                Dataset Label
              </label>
              <input
                type="text"
                value={datasetName}
                onChange={(e) => setDatasetName(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-xs text-slate-100 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <button
              onClick={handleLoadSample}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono underline cursor-pointer"
            >
              Load Kaggle Benchmark Sample
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-200 block">
              Raw Data (CSV or JSON with Unstructured Ticket / Feedback Column)
            </label>
            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste raw CSV or JSON with columns: CustomerID, Name, Plan, MRR, TenureMonths, MonthlyHours, BufferingIncidents, CustomerNotes..."
              className="w-full bg-slate-950 border border-slate-700/80 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 placeholder-slate-600 resize-none leading-relaxed"
            />
          </div>

          {error && (
            <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-lg text-rose-300 text-xs">
              {error}
            </div>
          )}

          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1">
            <div className="font-semibold text-slate-300">Ingestion Pipeline:</div>
            <div>
              1. Unstructured text features parsed into clean behavioral states (Playback Friction, Catalog Fatigue, Price Elasticity).
            </div>
            <div>
              2. Jev AI Parallel Categorical Arrays computed across 5 orthogonal vectors.
            </div>
            <div>
              3. Zero-shot customer grouping matrices classified into Critical, Moderate, and Retained tiers.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleProcess}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/20"
          >
            Process &amp; Run Zero-Shot Engine
          </button>
        </div>
      </div>
    </div>
  );
};
