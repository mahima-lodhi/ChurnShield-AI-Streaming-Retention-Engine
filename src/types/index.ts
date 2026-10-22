export type RiskTier = 'Critical' | 'Moderate' | 'Retained';

export interface BehavioralState {
  id: string;
  category: 'Friction' | 'Engagement' | 'Economic' | 'Content' | 'Household';
  label: string;
  confidence: number;
  sentiment: 'negative' | 'neutral' | 'positive';
  evidence: string;
}

export interface ParallelCategoricalArray {
  // Stream Engagement Index (0-100, higher is better)
  streamEngagementIndex: number;
  // Friction & Incident Array (0-100, higher is worse friction)
  frictionIncidentArray: number;
  // Economic Elasticity Array (0-100, higher is more price sensitive/strained)
  economicElasticityArray: number;
  // Social / Multi-Seat Matrix (0-100, higher is more sticky multi-profile usage)
  socialMultiSeatMatrix: number;
  // Content Velocity Vector (0-100, higher is faster new release consumption)
  contentVelocityVector: number;
}

export interface SubscriberRecord {
  id: string;
  name: string;
  email: string;
  avatarSeed: string;
  plan: 'Standard with Ads' | 'Standard HD' | 'Premium 4K Ultra' | 'Family Multi-Seat' | 'Annual Pass';
  mrr: number; // e.g. 9.99, 15.49, 22.99
  tenureMonths: number;
  lastActiveDays: number;
  monthlyHoursStreamed: number;
  completionRate: number; // 0.0 to 1.0
  bufferingIncidents: number; // incidents per 10 streaming hours
  playbackCrashes: number;
  unresolvedTickets: number;
  priceSensitivityScore: number; // 1-10
  activeProfiles: number; // 1-5
  contentCatalogBreadth: number; // 0-100
  newReleaseConsumption: number; // 0-100
  unstructuredNotes: string; // raw ticket/survey text
  parsedBehavioralStates: BehavioralState[];
  parallelArray: ParallelCategoricalArray;
  riskScore: number; // 0.0 to 1.0 (propensity to churn)
  riskTier: RiskTier;
  primaryRiskFactor: string;
  retentionStatus: 'Action Required' | 'Intervention Pending' | 'Offer Dispatched' | 'Shielded';
  dispatchedPlaybook?: RetentionPlaybook;
}

export interface RetentionPlaybook {
  rootCauseDiagnosis: string;
  recommendedInterventionOffer: string;
  targetedCommunicationCopy: string;
  expectedRetentionUplift: string;
  recommendedChannel: string;
  concessionCost: string;
  generatedAt?: string;
  dispatchedAt?: string;
}

export interface ModelHyperparameters {
  criticalThreshold: number; // default 0.70
  moderateThreshold: number; // default 0.35
  frictionMultiplier: number; // default 1.4
  contentVelocityWeight: number; // default 1.2
  engagementDecayWeight: number; // default 1.3
  priceElasticityWeight: number; // default 1.1
}

export interface PythonParsedCategory {
  category: string;
  severity: 'High' | 'Medium' | 'Low';
  snippet: string;
}

export interface PythonTransactionRecord {
  account_id: string;
  customer_name: string;
  plan_type: string;
  monthly_fee: number;
  tenure_months: number;
  payment_status: 'Paid' | 'Overdue';
  days_since_stream: number;
  monthly_stream_hours: number;
  buffering_events: number;
  support_tickets: number;
  unstructured_feedback: string;
  risk_score: number;
  loyalty_level: 'High Risk (Critical)' | 'Medium Risk (Watchlist)' | 'High Loyalty (Safe)';
  primary_category: string;
  parsed_categories: PythonParsedCategory[];
  recommended_action: string;
  // Jev AI Signature Categorical Arrays
  sei?: number;
  fia?: number;
  eea?: number;
  scm?: number;
  cvv?: number;
  // OpenJev Free-Tier Cloud Route (Choice, Score, Noul)
  openjev_choice?: 'Critical' | 'Moderate' | 'Retained';
  openjev_score?: number;
  openjev_noul?: number;
}

export interface SQLQueryPlanRow {
  id: number;
  parent: number;
  notused: number;
  detail: string;
}

export interface PythonQueryResult {
  query?: string;
  sql?: string;
  matched_count: number;
  execution_ms?: number;
  query_plan?: SQLQueryPlanRow[];
  data: any[];
  engine?: string;
  total_accounts?: number;
  high_risk_count?: number;
  medium_risk_count?: number;
  safe_count?: number;
  total_mrr?: number;
  at_risk_mrr?: number;
}

export interface KaggleDatasetInfo {
  id: string;
  filename: string;
  title: string;
  rowCount: number;
  sizeBytes: number;
  path: string;
}

export interface DatasetMeta {
  id: string;
  name: string;
  source: string;
  recordsCount: number;
  description: string;
  category: 'Video Streaming' | 'Telco & OTT Bundle' | 'Music & Audio';
  benchmarkAccuracy: string;
}

