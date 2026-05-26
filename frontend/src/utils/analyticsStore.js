/**
 * In-memory analytics for diagnostics panel (session-only, no persistence).
 */

const state = {
  livenessAttempts: 0,
  livenessSuccesses: 0,
  matchAttempts: 0,
  threshold: 0.5,
  webcamResolution: null,
  lastUpdated: Date.now(),
};

export function recordLivenessAttempt(success) {
  state.livenessAttempts++;
  if (success) state.livenessSuccesses++;
  state.lastUpdated = Date.now();
}

export function recordMatchAttempt() {
  state.matchAttempts++;
  state.lastUpdated = Date.now();
}

export function setThreshold(value) {
  state.threshold = value;
  state.lastUpdated = Date.now();
}

export function setWebcamResolution(width, height) {
  state.webcamResolution = { width, height };
  state.lastUpdated = Date.now();
}

export function getLivenessSuccessRate() {
  if (!state.livenessAttempts) return 0;
  return Math.round((state.livenessSuccesses / state.livenessAttempts) * 100);
}

export function getAnalyticsState() {
  return { ...state, livenessSuccessRate: getLivenessSuccessRate() };
}

export function subscribe(callback) {
  const interval = setInterval(() => callback(getAnalyticsState()), 1000);
  return () => clearInterval(interval);
}
