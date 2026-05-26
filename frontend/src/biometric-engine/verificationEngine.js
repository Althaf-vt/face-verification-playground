/**
 * Full onboarding verification simulation.
 * Auto-approve / manual review / reject logic for QA evaluation.
 *
 * NOT production KYC — false positives possible. Manual review still important.
 */

import { compareDescriptors } from './faceMatcher.js';
import { getLivenessResult } from './livenessDetector.js';

export const VERIFICATION_RESULTS = {
  AUTO_APPROVED: 'Auto Approved',
  MANUAL_REVIEW: 'Manual Review Required',
  REJECTED: 'Rejected',
};

export function evaluateVerification({
  matchResult,
  livenessSession,
  multiFaceDetected,
  lightingQuality,
  livenessPassed,
}) {
  if (multiFaceDetected) {
    return {
      result: VERIFICATION_RESULTS.REJECTED,
      reason: 'Multiple faces detected',
      details: { multiFace: true },
    };
  }

  if (lightingQuality?.isLowLight && lightingQuality.score < 30) {
    return {
      result: VERIFICATION_RESULTS.MANUAL_REVIEW,
      reason: 'Low lighting — retake recommended',
      details: { lighting: lightingQuality },
    };
  }

  if (!livenessPassed) {
    return {
      result: VERIFICATION_RESULTS.REJECTED,
      reason: 'Liveness verification failed',
      details: { liveness: getLivenessResult(livenessSession) },
    };
  }

  const distance = matchResult?.distance ?? 1;
  const similarity = matchResult?.similarityPercent ?? 0;

  if (distance <= 0.4 && livenessPassed) {
    return {
      result: VERIFICATION_RESULTS.AUTO_APPROVED,
      reason: 'High similarity and successful liveness',
      details: { distance, similarity, livenessScore: livenessSession?.livenessScore },
    };
  }

  if (distance <= 0.55 || (similarity >= 45 && livenessPassed)) {
    return {
      result: VERIFICATION_RESULTS.MANUAL_REVIEW,
      reason: 'Medium similarity — escalate to manual review',
      details: { distance, similarity },
    };
  }

  return {
    result: VERIFICATION_RESULTS.REJECTED,
    reason: 'Very low similarity or failed checks',
    details: { distance, similarity },
  };
}

export function runMatchComparison(descriptor1, descriptor2, threshold) {
  return compareDescriptors(descriptor1, descriptor2, threshold);
}
