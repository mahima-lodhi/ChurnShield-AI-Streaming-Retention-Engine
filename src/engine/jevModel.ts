import {
  SubscriberRecord,
  ParallelCategoricalArray,
  ModelHyperparameters,
  RiskTier,
} from '../types';

export const DEFAULT_HYPERPARAMETERS: ModelHyperparameters = {
  criticalThreshold: 0.68,
  moderateThreshold: 0.35,
  frictionMultiplier: 1.45,
  contentVelocityWeight: 1.25,
  engagementDecayWeight: 1.35,
  priceElasticityWeight: 1.15,
};

/**
 * Jev AI Signature Parallel Categorical Array Engine
 * Evaluates streaming subscriber states across orthogonal behavioral vectors.
 */
export function computeParallelCategoricalArray(
  sub: {
    monthlyHoursStreamed: number;
    completionRate: number;
    lastActiveDays: number;
    bufferingIncidents: number;
    playbackCrashes: number;
    unresolvedTickets: number;
    priceSensitivityScore: number;
    mrr: number;
    tenureMonths: number;
    activeProfiles: number;
    contentCatalogBreadth: number;
    newReleaseConsumption: number;
    [key: string]: any;
  },
  params: ModelHyperparameters
): ParallelCategoricalArray {
  // 1. Stream Engagement Index (SEI) [0 - 100]
  // High hours, high completion, low days since active => high SEI
  const hoursScore = Math.min(100, (sub.monthlyHoursStreamed / 60) * 100);
  const completionScore = sub.completionRate * 100;
  const recencyPenalty = Math.max(0, 100 - sub.lastActiveDays * 4.5);
  const seiRaw = (hoursScore * 0.45 + completionScore * 0.35 + recencyPenalty * 0.2);
  const streamEngagementIndex = Math.round(Math.max(5, Math.min(98, seiRaw)));

  // 2. Friction & Incident Array (FIA) [0 - 100]
  // Buffering events, app crashes, open tickets amplified by frictionMultiplier
  const bufferComponent = Math.min(70, sub.bufferingIncidents * 12 * params.frictionMultiplier);
  const crashComponent = Math.min(40, sub.playbackCrashes * 15);
  const ticketComponent = Math.min(30, sub.unresolvedTickets * 18);
  const fiaRaw = bufferComponent + crashComponent + ticketComponent;
  const frictionIncidentArray = Math.round(Math.max(2, Math.min(99, fiaRaw)));

  // 3. Economic Elasticity Array (EEA) [0 - 100]
  // Price sensitivity score, MRR ratio to baseline ($15)
  const priceSensComponent = (sub.priceSensitivityScore / 10) * 60;
  const mrrComponent = Math.min(40, (sub.mrr / 24.99) * 40 * params.priceElasticityWeight);
  // Short tenure with high cost increases price fatigue
  const tenureShield = Math.max(0, 20 - sub.tenureMonths * 0.8);
  const eeaRaw = priceSensComponent + mrrComponent + tenureShield;
  const economicElasticityArray = Math.round(Math.max(10, Math.min(96, eeaRaw)));

  // 4. Social / Multi-Seat Matrix (SCM) [0 - 100]
  // Active profiles: more profiles = stickier household network effect
  const profilesScore = Math.min(100, sub.activeProfiles * 22);
  const socialMultiSeatMatrix = Math.round(Math.max(15, Math.min(98, profilesScore)));

  // 5. Content Velocity Vector (CVV) [0 - 100]
  // Breadth of catalog viewed and new release consumption
  const catalogScore = sub.contentCatalogBreadth * 0.5;
  const newReleaseScore = sub.newReleaseConsumption * 0.5 * params.contentVelocityWeight;
  const cvvRaw = (catalogScore + newReleaseScore);
  const contentVelocityVector = Math.round(Math.max(8, Math.min(98, cvvRaw)));

  return {
    streamEngagementIndex,
    frictionIncidentArray,
    economicElasticityArray,
    socialMultiSeatMatrix,
    contentVelocityVector,
  };
}

/**
 * Zero-Shot Risk Propensity Scoring using Jev AI Parallel Categorical Arrays
 */
export function calculateZeroShotRisk(
  parallel: ParallelCategoricalArray,
  sub: { tenureMonths: number; lastActiveDays: number },
  params: ModelHyperparameters
): {
  riskScore: number;
  riskTier: RiskTier;
  primaryRiskFactor: string;
} {
  // Negative pressure components
  const frictionPressure = (parallel.frictionIncidentArray / 100) * 0.35 * params.frictionMultiplier;
  const engagementDecay = ((100 - parallel.streamEngagementIndex) / 100) * 0.30 * params.engagementDecayWeight;
  const economicPressure = (parallel.economicElasticityArray / 100) * 0.20 * params.priceElasticityWeight;
  const contentStagnation = ((100 - parallel.contentVelocityVector) / 100) * 0.15;

  // Positive retention buffers
  const multiSeatRetentionBuffer = (parallel.socialMultiSeatMatrix / 100) * 0.16;
  const tenureLoyaltyBuffer = Math.min(0.12, (sub.tenureMonths / 48) * 0.12);

  let rawScore = frictionPressure + engagementDecay + economicPressure + contentStagnation - multiSeatRetentionBuffer - tenureLoyaltyBuffer;
  
  // Severe inactivity penalty
  if (sub.lastActiveDays > 14) {
    rawScore += 0.18;
  } else if (sub.lastActiveDays > 7) {
    rawScore += 0.08;
  }

  const riskScore = Math.max(0.04, Math.min(0.97, Math.round(rawScore * 100) / 100));

  let riskTier: RiskTier = 'Retained';
  if (riskScore >= params.criticalThreshold) {
    riskTier = 'Critical';
  } else if (riskScore >= params.moderateThreshold) {
    riskTier = 'Moderate';
  }

  // Determine primary risk factor for root cause diagnosis
  let primaryRiskFactor = 'Stable Baseline Usage';
  if (riskScore >= params.moderateThreshold) {
    const drivers = [
      { name: 'Playback & Buffering Friction', value: parallel.frictionIncidentArray * params.frictionMultiplier },
      { name: 'Engagement & Watchtime Deceleration', value: (100 - parallel.streamEngagementIndex) * 1.1 },
      { name: 'Subscription Price Sensitivity', value: parallel.economicElasticityArray },
      { name: 'Catalog Exhaustion / Content Fatigue', value: 100 - parallel.contentVelocityVector },
      { name: 'Single-Seat Inactivity Vulnerability', value: (100 - parallel.socialMultiSeatMatrix) * 0.7 },
    ];
    drivers.sort((a, b) => b.value - a.value);
    primaryRiskFactor = drivers[0].name;
  }

  return { riskScore, riskTier, primaryRiskFactor };
}

/**
 * Computes Radar chart points for Subscriber Loyalty Footprints
 */
export function getLoyaltyFootprintMetrics(parallel: ParallelCategoricalArray) {
  return [
    { axis: 'Stream Engagement', value: parallel.streamEngagementIndex, benchmark: 82 },
    { axis: 'Friction Resistance', value: Math.max(0, 100 - parallel.frictionIncidentArray), benchmark: 88 },
    { axis: 'Perceived Value', value: Math.max(0, 100 - parallel.economicElasticityArray), benchmark: 76 },
    { axis: 'Multi-Seat Stickiness', value: parallel.socialMultiSeatMatrix, benchmark: 72 },
    { axis: 'Content Velocity', value: parallel.contentVelocityVector, benchmark: 80 },
  ];
}

/**
 * Calculates Fleet-wide SHAP-like behavioral feature attribution breakdown
 */
export function calculateFleetFeatureAttributions(subscribers: SubscriberRecord[]) {
  if (subscribers.length === 0) return [];

  let buffSum = 0;
  let decaySum = 0;
  let priceSum = 0;
  let contentSum = 0;
  let multiSeatSum = 0;

  subscribers.forEach((s) => {
    buffSum += s.parallelArray.frictionIncidentArray;
    decaySum += (100 - s.parallelArray.streamEngagementIndex);
    priceSum += s.parallelArray.economicElasticityArray;
    contentSum += (100 - s.parallelArray.contentVelocityVector);
    multiSeatSum += (100 - s.parallelArray.socialMultiSeatMatrix);
  });

  const count = subscribers.length;
  const total = (buffSum + decaySum + priceSum + contentSum + multiSeatSum) / count;

  return [
    {
      feature: 'Playback & Buffering Incidents (FIA)',
      impactScore: Math.round((buffSum / count / total) * 100),
      category: 'Friction',
      delta: '+14% vs last qtr',
    },
    {
      feature: 'Session Duration Deceleration (SEI)',
      impactScore: Math.round((decaySum / count / total) * 100),
      category: 'Engagement',
      delta: '+9% vs last qtr',
    },
    {
      feature: 'Plan Price Elasticity Strain (EEA)',
      impactScore: Math.round((priceSum / count / total) * 100),
      category: 'Economic',
      delta: '+6% vs last qtr',
    },
    {
      feature: 'Catalog Velocity & Premiere Drops (CVV)',
      impactScore: Math.round((contentSum / count / total) * 100),
      category: 'Content',
      delta: '-2% vs last qtr',
    },
    {
      feature: 'Single-Seat Isolation Risk (SCM)',
      impactScore: Math.round((multiSeatSum / count / total) * 100),
      category: 'Household',
      delta: '+3% vs last qtr',
    },
  ].sort((a, b) => b.impactScore - a.impactScore);
}
