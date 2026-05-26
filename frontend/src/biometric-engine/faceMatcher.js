/**
 * Face matching via euclidean descriptor distance.
 * Manual review is still important — false positives are possible.
 */

import { faceapi } from './modelLoader.js';

export const MATCH_THRESHOLDS = {
  STRONG: 0.4,
  MODERATE: 0.5,
  WEAK: 0.6,
};

export const MATCH_LABELS = {
  STRONG_MATCH: 'Strong Match',
  MODERATE_MATCH: 'Moderate Match',
  WEAK_MATCH: 'Weak Match',
  NO_MATCH: 'No Match',
};

export function euclideanDistance(descriptor1, descriptor2) {
  return faceapi.euclideanDistance(descriptor1, descriptor2);
}

export function distanceToSimilarityPercent(distance, maxDistance = 1.0) {
  const similarity = Math.max(0, Math.min(100, (1 - distance / maxDistance) * 100));
  return Math.round(similarity * 10) / 10;
}

export function classifyMatch(distance, threshold = MATCH_THRESHOLDS.MODERATE) {
  if (distance <= MATCH_THRESHOLDS.STRONG) {
    return { label: MATCH_LABELS.STRONG_MATCH, tier: 'strong' };
  }
  if (distance <= threshold) {
    return { label: MATCH_LABELS.MODERATE_MATCH, tier: 'moderate' };
  }
  if (distance <= MATCH_THRESHOLDS.WEAK) {
    return { label: MATCH_LABELS.WEAK_MATCH, tier: 'weak' };
  }
  return { label: MATCH_LABELS.NO_MATCH, tier: 'none' };
}

export function compareDescriptors(descriptor1, descriptor2, threshold = 0.5) {
  const distance = euclideanDistance(descriptor1, descriptor2);
  const similarityPercent = distanceToSimilarityPercent(distance);
  const classification = classifyMatch(distance, threshold);
  const isMatch = distance <= threshold;

  return {
    distance,
    similarityPercent,
    classification,
    isMatch,
    threshold,
    matchConfidence: Math.round((1 - distance) * 100),
  };
}
