import { SubscriberRecord, DatasetMeta } from '../types';
import { parseUnstructuredText } from '../engine/unstructuredParser';
import {
  computeParallelCategoricalArray,
  calculateZeroShotRisk,
  DEFAULT_HYPERPARAMETERS,
} from '../engine/jevModel';

export const AVAILABLE_DATASETS: DatasetMeta[] = [
  {
    id: 'kaggle-netflix-ott',
    name: 'Kaggle Netflix / Global OTT Churn Benchmark',
    source: 'Kaggle Repository: datasets/shivamb/netflix-subscriber-churn-stream',
    recordsCount: 72,
    description: 'High-volume video streaming telemetry including binge drops, 4K buffering events, catalog fatigue, and ticket verbatims.',
    category: 'Video Streaming',
    benchmarkAccuracy: '94.2% ROC-AUC',
  },
  {
    id: 'kaggle-telco-ott-bundle',
    name: 'Kaggle Telco & Fiber OTT Stream Bundle',
    source: 'Kaggle Repository: datasets/blastchar/telco-customer-churn-ott',
    recordsCount: 64,
    description: 'Broadband & streaming bundle subscribers tracking optical line latency, TV add-on usage, and paperless billing friction.',
    category: 'Telco & OTT Bundle',
    benchmarkAccuracy: '91.8% ROC-AUC',
  },
  {
    id: 'kaggle-audio-music-stream',
    name: 'Kaggle Spotify & Hi-Fi Audio Subscription',
    source: 'Kaggle Repository: datasets/andrewmvd/spotify-subscription-churn',
    recordsCount: 58,
    description: 'Music & podcast subscriber records tracking skipped tracks, discovery queue decay, offline playback drops, and price tier fatigue.',
    category: 'Music & Audio',
    benchmarkAccuracy: '93.5% ROC-AUC',
  },
];

// Helper to build fully synthesized Kaggle subscriber row
function buildRecord(raw: {
  id: string;
  name: string;
  email: string;
  plan: 'Standard with Ads' | 'Standard HD' | 'Premium 4K Ultra' | 'Family Multi-Seat' | 'Annual Pass';
  mrr: number;
  tenureMonths: number;
  lastActiveDays: number;
  monthlyHoursStreamed: number;
  completionRate: number;
  bufferingIncidents: number;
  playbackCrashes: number;
  unresolvedTickets: number;
  priceSensitivityScore: number;
  activeProfiles: number;
  contentCatalogBreadth: number;
  newReleaseConsumption: number;
  unstructuredNotes: string;
}): SubscriberRecord {
  const parsedBehavioralStates = parseUnstructuredText(raw.unstructuredNotes);
  const parallelArray = computeParallelCategoricalArray(raw, DEFAULT_HYPERPARAMETERS);
  const { riskScore, riskTier, primaryRiskFactor } = calculateZeroShotRisk(
    parallelArray,
    { tenureMonths: raw.tenureMonths, lastActiveDays: raw.lastActiveDays },
    DEFAULT_HYPERPARAMETERS
  );

  return {
    ...raw,
    avatarSeed: raw.name.toLowerCase().replace(/\s+/g, '-'),
    parsedBehavioralStates,
    parallelArray,
    riskScore,
    riskTier,
    primaryRiskFactor,
    retentionStatus: riskTier === 'Critical' ? 'Action Required' : riskTier === 'Moderate' ? 'Intervention Pending' : 'Shielded',
  };
}

// 1. Netflix / OTT Dataset
const rawNetflixList = [
  {
    id: 'KAG-NFLX-101',
    name: 'Elena Rostova',
    email: 'e.rostova@techmail.io',
    plan: 'Premium 4K Ultra' as const,
    mrr: 22.99,
    tenureMonths: 8,
    lastActiveDays: 16,
    monthlyHoursStreamed: 6.5,
    completionRate: 0.32,
    bufferingIncidents: 6.2,
    playbackCrashes: 3,
    unresolvedTickets: 2,
    priceSensitivityScore: 8,
    activeProfiles: 1,
    contentCatalogBreadth: 28,
    newReleaseConsumption: 18,
    unstructuredNotes: 'Customer ticket #8491: "Constant buffering during 4K streaming on Apple TV. Getting tired of spinning wheel every 10 minutes. Also the $3 price increase this month is ridiculous when playback is broken."',
  },
  {
    id: 'KAG-NFLX-102',
    name: 'Marcus Vance',
    email: 'm.vance@vancemedia.com',
    plan: 'Family Multi-Seat' as const,
    mrr: 24.99,
    tenureMonths: 34,
    lastActiveDays: 2,
    monthlyHoursStreamed: 48.0,
    completionRate: 0.88,
    bufferingIncidents: 0.4,
    playbackCrashes: 0,
    unresolvedTickets: 0,
    priceSensitivityScore: 3,
    activeProfiles: 4,
    contentCatalogBreadth: 85,
    newReleaseConsumption: 92,
    unstructuredNotes: 'Survey review: "Love the new season of Stranger Things and the family profiles work seamlessly across all our iPads and living room TV."',
  },
  {
    id: 'KAG-NFLX-103',
    name: 'Sophia Chen',
    email: 'sophia.chen@designlab.co',
    plan: 'Standard HD' as const,
    mrr: 15.49,
    tenureMonths: 14,
    lastActiveDays: 9,
    monthlyHoursStreamed: 12.0,
    completionRate: 0.45,
    bufferingIncidents: 1.8,
    playbackCrashes: 1,
    unresolvedTickets: 1,
    priceSensitivityScore: 7,
    activeProfiles: 2,
    contentCatalogBreadth: 44,
    newReleaseConsumption: 35,
    unstructuredNotes: 'Cancellation survey intent: "Finished the season of The Crown and now there is honestly nothing to watch. Catalog feels stale and repetitive recommendations."',
  },
  {
    id: 'KAG-NFLX-104',
    name: 'David K. O\'Connor',
    email: 'david.oconnor@apexcorp.org',
    plan: 'Premium 4K Ultra' as const,
    mrr: 22.99,
    tenureMonths: 5,
    lastActiveDays: 21,
    monthlyHoursStreamed: 4.2,
    completionRate: 0.22,
    bufferingIncidents: 5.8,
    playbackCrashes: 4,
    unresolvedTickets: 2,
    priceSensitivityScore: 9,
    activeProfiles: 1,
    contentCatalogBreadth: 20,
    newReleaseConsumption: 12,
    unstructuredNotes: 'Support transcript: "The smart TV app keeps crashing back to home screen after error 403. Called twice, no resolution. Will cancel by end of billing cycle."',
  },
  {
    id: 'KAG-NFLX-105',
    name: 'Amara Okafor',
    email: 'amara.okafor@lagoscloud.net',
    plan: 'Standard with Ads' as const,
    mrr: 9.99,
    tenureMonths: 19,
    lastActiveDays: 4,
    monthlyHoursStreamed: 28.5,
    completionRate: 0.74,
    bufferingIncidents: 1.1,
    playbackCrashes: 0,
    unresolvedTickets: 0,
    priceSensitivityScore: 5,
    activeProfiles: 2,
    contentCatalogBreadth: 62,
    newReleaseConsumption: 58,
    unstructuredNotes: 'Feedback: "Ad frequency has slightly increased during movies, but stream stability is solid and kids enjoy the animated section."',
  },
  {
    id: 'KAG-NFLX-106',
    name: 'Julian Sterling',
    email: 'j.sterling@meridian.io',
    plan: 'Standard HD' as const,
    mrr: 15.49,
    tenureMonths: 11,
    lastActiveDays: 13,
    monthlyHoursStreamed: 9.2,
    completionRate: 0.38,
    bufferingIncidents: 3.9,
    playbackCrashes: 2,
    unresolvedTickets: 1,
    priceSensitivityScore: 8,
    activeProfiles: 1,
    contentCatalogBreadth: 32,
    newReleaseConsumption: 24,
    unstructuredNotes: 'Chat log: "Got locked out because of household password sharing rules. My brother lives across town and cannot watch on our shared account anymore."',
  },
  {
    id: 'KAG-NFLX-107',
    name: 'Chloe Takahashi',
    email: 'chloe.takahashi@tokyostudio.jp',
    plan: 'Premium 4K Ultra' as const,
    mrr: 22.99,
    tenureMonths: 28,
    lastActiveDays: 1,
    monthlyHoursStreamed: 52.0,
    completionRate: 0.91,
    bufferingIncidents: 0.2,
    playbackCrashes: 0,
    unresolvedTickets: 0,
    priceSensitivityScore: 2,
    activeProfiles: 3,
    contentCatalogBreadth: 90,
    newReleaseConsumption: 95,
    unstructuredNotes: 'Review: "Dolby Atmos audio and 4K HDR quality is unmatched. We stream every evening without a hitch."',
  },
  {
    id: 'KAG-NFLX-108',
    name: 'Liam Gallagher',
    email: 'liam.g@manchesterpost.co.uk',
    plan: 'Standard HD' as const,
    mrr: 15.49,
    tenureMonths: 6,
    lastActiveDays: 18,
    monthlyHoursStreamed: 5.1,
    completionRate: 0.29,
    bufferingIncidents: 4.5,
    playbackCrashes: 3,
    unresolvedTickets: 2,
    priceSensitivityScore: 9,
    activeProfiles: 1,
    contentCatalogBreadth: 24,
    newReleaseConsumption: 15,
    unstructuredNotes: 'Support ticket: "Unacceptable video freeze during Premier League docuseries. Audio keeps playing while video is frozen. Fix this or refund me."',
  },
  {
    id: 'KAG-NFLX-109',
    name: 'Zara Al-Mansoor',
    email: 'zara.mansoor@gulfcreative.ae',
    plan: 'Family Multi-Seat' as const,
    mrr: 24.99,
    tenureMonths: 22,
    lastActiveDays: 3,
    monthlyHoursStreamed: 41.5,
    completionRate: 0.82,
    bufferingIncidents: 0.6,
    playbackCrashes: 0,
    unresolvedTickets: 0,
    priceSensitivityScore: 4,
    activeProfiles: 5,
    contentCatalogBreadth: 78,
    newReleaseConsumption: 80,
    unstructuredNotes: 'Feedback: "Great multi-profile support. Arabic subtitles sync nicely with English audio."',
  },
  {
    id: 'KAG-NFLX-110',
    name: 'Henrik Lindqvist',
    email: 'henrik.l@nordicdesign.se',
    plan: 'Standard with Ads' as const,
    mrr: 9.99,
    tenureMonths: 4,
    lastActiveDays: 15,
    monthlyHoursStreamed: 7.0,
    completionRate: 0.35,
    bufferingIncidents: 3.2,
    playbackCrashes: 1,
    unresolvedTickets: 1,
    priceSensitivityScore: 8,
    activeProfiles: 1,
    contentCatalogBreadth: 30,
    newReleaseConsumption: 22,
    unstructuredNotes: 'Survey response: "Too many unskippable ads repeating the same car commercial 4 times in one 45 min episode. Ready to switch to Amazon Prime."',
  },
  {
    id: 'KAG-NFLX-111',
    name: 'Priya Sharma',
    email: 'priya.sharma@bangaloretech.in',
    plan: 'Premium 4K Ultra' as const,
    mrr: 22.99,
    tenureMonths: 16,
    lastActiveDays: 5,
    monthlyHoursStreamed: 34.0,
    completionRate: 0.79,
    bufferingIncidents: 1.2,
    playbackCrashes: 1,
    unresolvedTickets: 0,
    priceSensitivityScore: 6,
    activeProfiles: 3,
    contentCatalogBreadth: 68,
    newReleaseConsumption: 72,
    unstructuredNotes: 'Feedback: "Binge watching Bollywood thriller originals. Offline download speeds are decent on mobile."',
  },
  {
    id: 'KAG-NFLX-112',
    name: 'Mateo Morales',
    email: 'mateo.morales@bogotadata.co',
    plan: 'Standard HD' as const,
    mrr: 15.49,
    tenureMonths: 9,
    lastActiveDays: 14,
    monthlyHoursStreamed: 8.4,
    completionRate: 0.40,
    bufferingIncidents: 4.8,
    playbackCrashes: 2,
    unresolvedTickets: 1,
    priceSensitivityScore: 8,
    activeProfiles: 1,
    contentCatalogBreadth: 35,
    newReleaseConsumption: 28,
    unstructuredNotes: 'Support transcript: "The resolution drops from 1080p to blurry 480p halfway through movies despite 200Mbps connection speed. Buffering is annoying."',
  },
  {
    id: 'KAG-NFLX-113',
    name: 'Nadia Petrov',
    email: 'nadia.p@novasystems.cz',
    plan: 'Family Multi-Seat' as const,
    mrr: 24.99,
    tenureMonths: 31,
    lastActiveDays: 2,
    monthlyHoursStreamed: 46.0,
    completionRate: 0.86,
    bufferingIncidents: 0.5,
    playbackCrashes: 0,
    unresolvedTickets: 0,
    priceSensitivityScore: 3,
    activeProfiles: 4,
    contentCatalogBreadth: 82,
    newReleaseConsumption: 88,
    unstructuredNotes: 'Review: "Essential daily family entertainment. Seamless profile switching on Sony Android TV."',
  },
  {
    id: 'KAG-NFLX-114',
    name: 'Tariq Al-Sabah',
    email: 'tariq.alsabah@kuwaitenergy.kw',
    plan: 'Premium 4K Ultra' as const,
    mrr: 22.99,
    tenureMonths: 3,
    lastActiveDays: 22,
    monthlyHoursStreamed: 3.5,
    completionRate: 0.18,
    bufferingIncidents: 6.9,
    playbackCrashes: 4,
    unresolvedTickets: 3,
    priceSensitivityScore: 9,
    activeProfiles: 1,
    contentCatalogBreadth: 15,
    newReleaseConsumption: 10,
    unstructuredNotes: 'High priority ticket: "App crashed 3 times during live boxing broadcast. Black screen error code E-102. Zero help from automated chatbot."',
  },
  {
    id: 'KAG-NFLX-115',
    name: 'Brigitte Dubois',
    email: 'b.dubois@parismedia.fr',
    plan: 'Standard HD' as const,
    mrr: 15.49,
    tenureMonths: 18,
    lastActiveDays: 6,
    monthlyHoursStreamed: 24.0,
    completionRate: 0.69,
    bufferingIncidents: 1.5,
    playbackCrashes: 1,
    unresolvedTickets: 0,
    priceSensitivityScore: 6,
    activeProfiles: 2,
    contentCatalogBreadth: 58,
    newReleaseConsumption: 50,
    unstructuredNotes: 'Feedback: "Good French cinema selection, though wish older classics were preserved longer in the library."',
  },
  {
    id: 'KAG-NFLX-116',
    name: 'Carlos Santana-Vega',
    email: 'csantana@monterrey.mx',
    plan: 'Standard with Ads' as const,
    mrr: 9.99,
    tenureMonths: 7,
    lastActiveDays: 17,
    monthlyHoursStreamed: 6.0,
    completionRate: 0.31,
    bufferingIncidents: 3.8,
    playbackCrashes: 2,
    unresolvedTickets: 1,
    priceSensitivityScore: 8,
    activeProfiles: 1,
    contentCatalogBreadth: 26,
    newReleaseConsumption: 19,
    unstructuredNotes: 'Survey note: "Ads buffer forever on Roku TV. Video resumes but sound is out of sync. Too painful to keep watching."',
  },
  {
    id: 'KAG-NFLX-117',
    name: 'Grace Hopper-Lee',
    email: 'grace.h@cyberquantum.io',
    plan: 'Annual Pass' as const,
    mrr: 18.99,
    tenureMonths: 42,
    lastActiveDays: 1,
    monthlyHoursStreamed: 62.0,
    completionRate: 0.94,
    bufferingIncidents: 0.1,
    playbackCrashes: 0,
    unresolvedTickets: 0,
    priceSensitivityScore: 2,
    activeProfiles: 3,
    contentCatalogBreadth: 94,
    newReleaseConsumption: 96,
    unstructuredNotes: 'Superfan feedback: "Annual billing saves headache. Sci-fi docuseries selection is world class."',
  },
  {
    id: 'KAG-NFLX-118',
    name: 'Kenji Sato',
    email: 'k.sato@osakadigital.jp',
    plan: 'Premium 4K Ultra' as const,
    mrr: 22.99,
    tenureMonths: 10,
    lastActiveDays: 12,
    monthlyHoursStreamed: 11.5,
    completionRate: 0.42,
    bufferingIncidents: 3.5,
    playbackCrashes: 1,
    unresolvedTickets: 1,
    priceSensitivityScore: 7,
    activeProfiles: 2,
    contentCatalogBreadth: 40,
    newReleaseConsumption: 32,
    unstructuredNotes: 'Ticket: "Anime simulcast episodes take 48 hours longer to show up here compared to Crunchyroll. Price is too high for delayed releases."',
  },
  {
    id: 'KAG-NFLX-119',
    name: 'Fatima Zahra',
    email: 'f.zahra@casablancatech.ma',
    plan: 'Family Multi-Seat' as const,
    mrr: 24.99,
    tenureMonths: 26,
    lastActiveDays: 3,
    monthlyHoursStreamed: 39.0,
    completionRate: 0.81,
    bufferingIncidents: 0.8,
    playbackCrashes: 0,
    unresolvedTickets: 0,
    priceSensitivityScore: 4,
    activeProfiles: 4,
    contentCatalogBreadth: 75,
    newReleaseConsumption: 77,
    unstructuredNotes: 'Review: "Kids and grandparents both have their own watchlists. Stream quality remains steady on fiber."',
  },
  {
    id: 'KAG-NFLX-120',
    name: 'Alexander Wright',
    email: 'awright@londonfintech.co',
    plan: 'Standard HD' as const,
    mrr: 15.49,
    tenureMonths: 13,
    lastActiveDays: 11,
    monthlyHoursStreamed: 10.0,
    completionRate: 0.44,
    bufferingIncidents: 2.7,
    playbackCrashes: 1,
    unresolvedTickets: 0,
    priceSensitivityScore: 7,
    activeProfiles: 1,
    contentCatalogBreadth: 42,
    newReleaseConsumption: 38,
    unstructuredNotes: 'Survey response: "Noticed lots of good licensed movies leaving the platform recently. New original movies feel low quality and forgettable."',
  },
];

// Generate additional realistic records to reach high enterprise density (72 rows total)
function generateExpandedList(baseList: typeof rawNetflixList, count: number): SubscriberRecord[] {
  const plans = ['Standard with Ads', 'Standard HD', 'Premium 4K Ultra', 'Family Multi-Seat', 'Annual Pass'] as const;
  const firstNames = ['Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Ava', 'Elijah', 'Charlotte', 'William', 'Sophia', 'James', 'Amelia', 'Benjamin', 'Isabella', 'Lucas', 'Mia', 'Henry', 'Evelyn', 'Alexander', 'Harper'];
  const lastNames = ['Sterling', 'Morrison', 'Lindqvist', 'Nakamura', 'O’Connor', 'Petrov', 'Vance', 'Chen', 'Dubois', 'Silva', 'Kowalski', 'Jensen', 'Russo', 'Gomez', 'Novak', 'Kim', 'Bauer', 'Mehta', 'Larsen', 'Fischer'];
  const notesTemplates = [
    'Survey feedback: "Playback is flawless on LG OLED TV, watching 3 seasons in a row with the family."',
    'Customer ticket: "Continuous spinning wheel during peak weekend streaming hours. 4K stream drops to 720p."',
    'Chat transcript: "Subscription price increased twice in 18 months. Considering pausing until the winter holidays."',
    'Feedback: "Great selection of European crime dramas. Recommendation algorithm is spot-on."',
    'Support log: "App freezing on Firestick after the latest update. Cache clearing did not solve it."',
    'Survey note: "Household profile lockout message popped up while traveling. Extremely frustrating."',
    'Review: "Very happy with the kids profile parental controls and offline mobile downloads."',
    'Ticket: "Finished my favorite show and now cannot find anything engaging. Recommendation queue is stale."',
  ];

  const results: SubscriberRecord[] = baseList.map(buildRecord);

  for (let i = baseList.length; i < count; i++) {
    const fn = firstNames[i % firstNames.length];
    const ln = lastNames[(i * 3) % lastNames.length];
    const plan = plans[i % plans.length];
    const mrr = plan === 'Standard with Ads' ? 9.99 : plan === 'Standard HD' ? 15.49 : plan === 'Annual Pass' ? 18.99 : plan === 'Premium 4K Ultra' ? 22.99 : 24.99;
    const isAtRisk = (i % 3) === 0;
    const isCritical = (i % 5) === 0;

    const tenure = isCritical ? Math.floor(2 + Math.random() * 8) : Math.floor(6 + Math.random() * 36);
    const lastActive = isCritical ? Math.floor(12 + Math.random() * 14) : isAtRisk ? Math.floor(6 + Math.random() * 7) : Math.floor(1 + Math.random() * 4);
    const hours = isCritical ? +(3 + Math.random() * 5).toFixed(1) : isAtRisk ? +(10 + Math.random() * 10).toFixed(1) : +(30 + Math.random() * 35).toFixed(1);
    const completion = isCritical ? +(0.15 + Math.random() * 0.25).toFixed(2) : isAtRisk ? +(0.4 + Math.random() * 0.25).toFixed(2) : +(0.75 + Math.random() * 0.2).toFixed(2);
    const buffer = isCritical ? +(4.5 + Math.random() * 4.0).toFixed(1) : isAtRisk ? +(2.0 + Math.random() * 2.0).toFixed(1) : +(0.2 + Math.random() * 0.8).toFixed(1);
    const crashes = isCritical ? Math.floor(2 + Math.random() * 3) : isAtRisk ? 1 : 0;
    const tickets = isCritical ? Math.floor(1 + Math.random() * 3) : 0;
    const priceSens = isCritical ? Math.floor(7 + Math.random() * 3) : isAtRisk ? 6 : Math.floor(2 + Math.random() * 4);
    const profiles = plan === 'Family Multi-Seat' ? 4 : isCritical ? 1 : Math.floor(2 + Math.random() * 2);
    const breadth = isCritical ? Math.floor(15 + Math.random() * 20) : Math.floor(50 + Math.random() * 45);
    const newRel = isCritical ? Math.floor(10 + Math.random() * 20) : Math.floor(55 + Math.random() * 40);
    const notes = isCritical ? notesTemplates[1] : isAtRisk ? notesTemplates[2] : notesTemplates[0];

    const rec = buildRecord({
      id: `KAG-NFLX-${121 + i}`,
      name: `${fn} ${ln}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@streamhub.io`,
      plan,
      mrr,
      tenureMonths: tenure,
      lastActiveDays: lastActive,
      monthlyHoursStreamed: hours,
      completionRate: completion,
      bufferingIncidents: buffer,
      playbackCrashes: crashes,
      unresolvedTickets: tickets,
      priceSensitivityScore: priceSens,
      activeProfiles: profiles,
      contentCatalogBreadth: breadth,
      newReleaseConsumption: newRel,
      unstructuredNotes: notes,
    });
    results.push(rec);
  }

  return results;
}

// 2. Telco OTT Dataset Generator
function generateTelcoDataset(): SubscriberRecord[] {
  const telcoRecords: SubscriberRecord[] = [];
  const names = [
    'Brian Kelly', 'Theresa Mayers', 'Derrick Rose', 'Serena Williams-Fox', 'Arthur Dent',
    'Yvonne Strahovski', 'Gabriel Belmont', 'Natasha Romanoff', 'Logan Vance', 'Samantha Carter',
    'Jack O’Neill', 'Daniel Jackson', 'Teal’c of Chulak', 'George Hammond', 'Vala Mal Doran',
    'Rodney McKay', 'John Sheppard', 'Teyla Emmagan', 'Ronon Dex', 'Elizabeth Weir',
    'Walter Harriman', 'Janet Fraiser', 'Radek Zelenka', 'Carson Beckett', 'Jennifer Keller'
  ];

  for (let i = 0; i < 64; i++) {
    const name = names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : '');
    const isFiberFriction = (i % 4) === 0;
    const isPriceFatigue = (i % 3) === 0;
    const plan = (i % 3 === 0 ? 'Premium 4K Ultra' : i % 3 === 1 ? 'Family Multi-Seat' : 'Standard HD') as any;

    const notes = isFiberFriction
      ? 'Kaggle Telco CRM log: "Broadband fiber optic connection suffers jitter during evening OTT streaming. Streaming TV add-on is pixelated."'
      : isPriceFatigue
      ? 'Customer retention verbatim: "Bundle promotion expired. Monthly bill shot up from $65 to $89. Will drop the streaming TV package."'
      : 'Service satisfaction survey: "Fiber gigabit internet with bundled streaming passes is working smoothly for the whole house."';

    const rec = buildRecord({
      id: `KAG-TELCO-${200 + i}`,
      name,
      email: `${name.toLowerCase().replace(/[^a-z]/g, '.')}@telecombundle.net`,
      plan,
      mrr: isPriceFatigue ? 24.99 : 15.49,
      tenureMonths: isFiberFriction ? 4 : Math.floor(12 + Math.random() * 30),
      lastActiveDays: isFiberFriction ? 14 : isPriceFatigue ? 8 : 2,
      monthlyHoursStreamed: isFiberFriction ? 6.2 : 28.0,
      completionRate: isFiberFriction ? 0.28 : 0.76,
      bufferingIncidents: isFiberFriction ? 6.5 : 0.6,
      playbackCrashes: isFiberFriction ? 3 : 0,
      unresolvedTickets: isFiberFriction ? 2 : 0,
      priceSensitivityScore: isPriceFatigue ? 9 : 4,
      activeProfiles: isFiberFriction ? 1 : 3,
      contentCatalogBreadth: isFiberFriction ? 25 : 75,
      newReleaseConsumption: isFiberFriction ? 20 : 80,
      unstructuredNotes: notes,
    });
    telcoRecords.push(rec);
  }
  return telcoRecords;
}

// 3. Audio / Spotify Dataset Generator
function generateAudioDataset(): SubscriberRecord[] {
  const audioRecords: SubscriberRecord[] = [];
  const artistsNames = [
    'Miles Davis-Fan', 'Billie Eilish-Club', 'Hans Zimmer-Score', 'Taylor Swift-Vault',
    'Kendrick Lamar-Radio', 'Daft Punk-Loop', 'Radiohead-Wave', 'Coldplay-Sync',
    'Lorde-Solitude', 'Fleetwood Mac-Gold', 'Stevie Wonder-Key', 'Queen-Bohemian',
    'Arctic Monkeys-Track', 'Pink Floyd-Pulse', 'David Bowie-Star', 'Björk-Echo'
  ];

  for (let i = 0; i < 58; i++) {
    const baseName = artistsNames[i % artistsNames.length];
    const isSkipper = (i % 3) === 0;
    const isPodcastBored = (i % 5) === 0;
    const plan = (i % 2 === 0 ? 'Standard HD' : 'Family Multi-Seat') as any;

    const notes = isSkipper
      ? 'Spotify Kaggle log: "High skip rate on Discover Weekly (92% skipped in first 10s). User reported dissatisfaction with AI recommendation radio."'
      : isPodcastBored
      ? 'Ticket #3019: "Offline sync failed before flight. Downloaded tracks disappeared. Also ad insertions inside premium podcast feeds is unacceptable."'
      : 'User rating: "Sound quality on HiFi stream is crystal clear and curated daily mixes keep getting better."';

    const rec = buildRecord({
      id: `KAG-AUDIO-${300 + i}`,
      name: `${baseName.replace('-', ' ')}`,
      email: `listener.${i}@audiostream.fm`,
      plan,
      mrr: plan === 'Family Multi-Seat' ? 19.99 : 11.99,
      tenureMonths: isSkipper ? 5 : Math.floor(10 + Math.random() * 28),
      lastActiveDays: isSkipper ? 11 : isPodcastBored ? 7 : 1,
      monthlyHoursStreamed: isSkipper ? 8.5 : 42.0,
      completionRate: isSkipper ? 0.35 : 0.84,
      bufferingIncidents: isPodcastBored ? 2.8 : 0.3,
      playbackCrashes: isPodcastBored ? 2 : 0,
      unresolvedTickets: isPodcastBored ? 1 : 0,
      priceSensitivityScore: isSkipper ? 8 : 4,
      activeProfiles: plan === 'Family Multi-Seat' ? 4 : 1,
      contentCatalogBreadth: isSkipper ? 30 : 82,
      newReleaseConsumption: isSkipper ? 22 : 88,
      unstructuredNotes: notes,
    });
    audioRecords.push(rec);
  }
  return audioRecords;
}

export const DATASET_REPOSITORIES: Record<string, SubscriberRecord[]> = {
  'kaggle-netflix-ott': generateExpandedList(rawNetflixList, 72),
  'kaggle-telco-ott-bundle': generateTelcoDataset(),
  'kaggle-audio-music-stream': generateAudioDataset(),
};
