import { BehavioralState } from '../types';

/**
 * Modular Unstructured Feature Parser
 * Extracts behavioral state vectors from raw unstructured customer verbatims,
 * ticket transcripts, and playback log excerpts.
 */
export function parseUnstructuredText(text: string): BehavioralState[] {
  if (!text || text.trim() === '') {
    return [
      {
        id: `state-${Math.random().toString(36).substring(2, 7)}`,
        category: 'Engagement',
        label: 'Baseline Steady Streamer',
        confidence: 0.85,
        sentiment: 'positive',
        evidence: 'Consistent standard playback logs without incident flags',
      },
    ];
  }

  const lower = text.toLowerCase();
  const states: BehavioralState[] = [];

  // 1. Friction & Playback Failure Signals
  if (
    lower.includes('buffer') ||
    lower.includes('freeze') ||
    lower.includes('lag') ||
    lower.includes('stuck') ||
    lower.includes('spinning wheel') ||
    lower.includes('error 403') ||
    lower.includes('crash') ||
    lower.includes('audio desync') ||
    lower.includes('hd not loading') ||
    lower.includes('resolution drop')
  ) {
    const match = text.match(/([^.?!]*(?:buffer|freeze|lag|crash|error|spinning)[^.?!]*[.?!]?)/i);
    states.push({
      id: `state-fric-${Math.random().toString(36).substring(2, 6)}`,
      category: 'Friction',
      label: 'Playback Degradation & Buffering',
      confidence: 0.94,
      sentiment: 'negative',
      evidence: match ? match[0].trim() : text.slice(0, 75),
    });
  }

  // 2. Content Exhaustion & Catalog Fatigue
  if (
    lower.includes('nothing to watch') ||
    lower.includes('finished the season') ||
    lower.includes('no new movie') ||
    lower.includes('catalog is stale') ||
    lower.includes('cancelled my favorite show') ||
    lower.includes('bored of the selection') ||
    lower.includes('too many bad recommendations') ||
    lower.includes('repetitive content') ||
    lower.includes('skip')
  ) {
    const match = text.match(/([^.?!]*(?:nothing to watch|catalog|stale|selection|cancelled show|bored)[^.?!]*[.?!]?)/i);
    states.push({
      id: `state-cont-${Math.random().toString(36).substring(2, 6)}`,
      category: 'Content',
      label: 'Catalog Exhaustion / Binge Drop-off',
      confidence: 0.91,
      sentiment: 'negative',
      evidence: match ? match[0].trim() : text.slice(0, 75),
    });
  }

  // 3. Economic Price Strain & Bill Shock
  if (
    lower.includes('price increase') ||
    lower.includes('too expensive') ||
    lower.includes('not worth $') ||
    lower.includes('cost too much') ||
    lower.includes('unauthorized charge') ||
    lower.includes('can get cheaper') ||
    lower.includes('monthly fee jumped') ||
    lower.includes('budget cuts')
  ) {
    const match = text.match(/([^.?!]*(?:price|expensive|cost|charge|fee|budget)[^.?!]*[.?!]?)/i);
    states.push({
      id: `state-econ-${Math.random().toString(36).substring(2, 6)}`,
      category: 'Economic',
      label: 'Price Elasticity & Cost Discontent',
      confidence: 0.89,
      sentiment: 'negative',
      evidence: match ? match[0].trim() : text.slice(0, 75),
    });
  }

  // 4. Household, Multi-device, or Profile Sharing Restrictions
  if (
    lower.includes('household') ||
    lower.includes('password sharing') ||
    lower.includes('extra member fee') ||
    lower.includes('kids moving') ||
    lower.includes('tv app not supported') ||
    lower.includes('device limit') ||
    lower.includes('logged out from smart tv')
  ) {
    const match = text.match(/([^.?!]*(?:household|sharing|member|device limit|smart tv|logged out)[^.?!]*[.?!]?)/i);
    states.push({
      id: `state-house-${Math.random().toString(36).substring(2, 6)}`,
      category: 'Household',
      label: 'Multi-Device & Sharing Constraint',
      confidence: 0.87,
      sentiment: 'negative',
      evidence: match ? match[0].trim() : text.slice(0, 75),
    });
  }

  // 5. Positive / High Engagement Signals
  if (
    lower.includes('love the new series') ||
    lower.includes('great 4k quality') ||
    lower.includes('watched every episode') ||
    lower.includes('fantastic app') ||
    lower.includes('family loves it')
  ) {
    states.push({
      id: `state-pos-${Math.random().toString(36).substring(2, 6)}`,
      category: 'Engagement',
      label: 'High Affinity Streamer',
      confidence: 0.95,
      sentiment: 'positive',
      evidence: 'Expressed high enthusiasm and steady consumption in review',
    });
  }

  // Fallback if no specific condition matched
  if (states.length === 0) {
    states.push({
      id: `state-gen-${Math.random().toString(36).substring(2, 6)}`,
      category: 'Engagement',
      label: 'Passive Consumption Decay',
      confidence: 0.78,
      sentiment: 'neutral',
      evidence: text.slice(0, 80),
    });
  }

  return states;
}
