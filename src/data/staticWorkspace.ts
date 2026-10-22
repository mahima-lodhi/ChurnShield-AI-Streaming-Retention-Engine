import { DATASET_REPOSITORIES } from './kaggleDatasets';
import { KaggleDatasetInfo, PythonTransactionRecord, SubscriberRecord } from '../types';

export const STATIC_DATASETS: KaggleDatasetInfo[] = [
  { id: 'kaggle-netflix-ott', filename: 'kaggle_ott_streaming_churn.csv', title: 'Kaggle Netflix / Global OTT Churn Benchmark', rowCount: 72, sizeBytes: 4652, path: 'src/data/kaggleDatasets.ts' },
  { id: 'kaggle-telco-ott-bundle', filename: 'kaggle_telco_bundle_churn.csv', title: 'Kaggle Telco & Fiber OTT Stream Bundle', rowCount: 64, sizeBytes: 4652, path: 'src/data/kaggleDatasets.ts' },
  { id: 'kaggle-audio-music-stream', filename: 'kaggle_audio_music_churn.csv', title: 'Kaggle Spotify & Hi-Fi Audio Subscription', rowCount: 58, sizeBytes: 4652, path: 'src/data/kaggleDatasets.ts' },
];

const datasetIds: Record<string, string> = {
  'kaggle_ott_streaming_churn.csv': 'kaggle-netflix-ott',
  'kaggle_telco_bundle_churn.csv': 'kaggle-telco-ott-bundle',
  'kaggle_audio_music_churn.csv': 'kaggle-audio-music-stream',
};

function toPythonRecord(record: SubscriberRecord): PythonTransactionRecord {
  const riskScore = Math.round(record.riskScore * 100);
  return {
    account_id: record.id,
    customer_name: record.name,
    plan_type: record.plan,
    monthly_fee: record.mrr,
    tenure_months: record.tenureMonths,
    payment_status: riskScore >= 80 ? 'Overdue' : 'Paid',
    days_since_stream: record.lastActiveDays,
    monthly_stream_hours: record.monthlyHoursStreamed,
    buffering_events: Math.round(record.bufferingIncidents),
    support_tickets: record.unresolvedTickets,
    unstructured_feedback: record.unstructuredNotes,
    risk_score: riskScore,
    loyalty_level: riskScore >= 65 ? 'High Risk (Critical)' : riskScore >= 35 ? 'Medium Risk (Watchlist)' : 'High Loyalty (Safe)',
    primary_category: record.primaryRiskFactor,
    parsed_categories: record.parsedBehavioralStates.map((state) => ({
      category: state.category,
      severity: state.sentiment === 'negative' ? 'High' : state.sentiment === 'neutral' ? 'Medium' : 'Low',
      snippet: state.evidence,
    })),
    recommended_action: riskScore >= 65 ? 'Priority retention outreach' : 'Standard loyalty maintenance',
    sei: record.parallelArray.streamEngagementIndex,
    fia: record.parallelArray.frictionIncidentArray,
    eea: record.parallelArray.economicElasticityArray,
    scm: record.parallelArray.socialMultiSeatMatrix,
    cvv: record.parallelArray.contentVelocityVector,
  };
}

export function getStaticRecords(filename: string): PythonTransactionRecord[] {
  const source = DATASET_REPOSITORIES[datasetIds[filename] || 'kaggle-netflix-ott'];
  return source.map(toPythonRecord);
}

export function recordsToCsv(records: PythonTransactionRecord[]): string {
  const headers = ['Account_ID', 'Customer_Name', 'Plan_Type', 'Monthly_Fee', 'Tenure_Months', 'Payment_Status', 'Days_Since_Stream', 'Monthly_Stream_Hours', 'Buffering_Events', 'Support_Tickets', 'Primary_Category', 'Risk_Score', 'Loyalty_Level'];
  return [headers.join(','), ...records.map((record) => [
    record.account_id, `"${record.customer_name}"`, `"${record.plan_type}"`, record.monthly_fee, record.tenure_months,
    record.payment_status, record.days_since_stream, record.monthly_stream_hours, record.buffering_events,
    record.support_tickets, `"${record.primary_category}"`, record.risk_score, `"${record.loyalty_level}"`,
  ].join(','))].join('\n');
}
