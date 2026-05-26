/**
 * Lightweight liveness validation for QA testing.
 *
 * SECURITY: Anti-static-photo checks are heuristic only.
 * Not banking-grade. Suitable for prototype onboarding flow evaluation.
 */

export const LIVENESS_STEPS = [
  { id: 'blink', label: 'Blink your eyes', duration: 15000 },
  { id: 'turn_left', label: 'Turn head left', duration: 15000 },
  { id: 'turn_right', label: 'Turn head right', duration: 15000 },
  { id: 'smile', label: 'Smile naturally', duration: 15000 },
  { id: 'nod', label: 'Nod slightly', duration: 15000 },
];

const EAR_BLINK_THRESHOLD = 0.21;
const HEAD_TURN_THRESHOLD = 0.12;
const SMILE_THRESHOLD = 0.6;
const NOD_DELTA_THRESHOLD = 0.025;

function eyeAspectRatio(landmarks) {
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();

  const calcEAR = (eye) => {
    const v1 = Math.hypot(eye[1].x - eye[5].x, eye[1].y - eye[5].y);
    const v2 = Math.hypot(eye[2].x - eye[4].x, eye[2].y - eye[4].y);
    const h = Math.hypot(eye[0].x - eye[3].x, eye[0].y - eye[3].y);
    return (v1 + v2) / (2 * h);
  };

  return (calcEAR(leftEye) + calcEAR(rightEye)) / 2;
}

function noseOffsetRatio(landmarks, box) {
  const nose = landmarks.getNose()[3];
  const centerX = box.x + box.width / 2;
  return (nose.x - centerX) / box.width;
}

function chinYOffset(landmarks) {
  const jaw = landmarks.getJawOutline();
  const chin = jaw[8];
  const mid = jaw[0];
  return chin.y - mid.y;
}

export function createLivenessSession() {
  return {
    currentStepIndex: 0,
    completedSteps: [],
    stepScores: {},
    startedAt: Date.now(),
    frameHistory: [],
    lastNoseY: null,
    blinkState: { wasClosed: false, completed: false },
    staticFrameCount: 0,
    livenessScore: 0,
    status: 'idle',
    failures: [],
  };
}

export function checkBlink(landmarks, session) {
  const ear = eyeAspectRatio(landmarks);
  if (ear < EAR_BLINK_THRESHOLD) {
    session.blinkState.wasClosed = true;
  } else if (session.blinkState.wasClosed && ear >= EAR_BLINK_THRESHOLD) {
    session.blinkState.completed = true;
    return true;
  }
  return session.blinkState.completed;
}

export function checkHeadTurnLeft(landmarks, box) {
  return noseOffsetRatio(landmarks, box) < -HEAD_TURN_THRESHOLD;
}

export function checkHeadTurnRight(landmarks, box) {
  return noseOffsetRatio(landmarks, box) > HEAD_TURN_THRESHOLD;
}

export function checkSmile(expressions) {
  return (expressions?.happy ?? 0) >= SMILE_THRESHOLD;
}

export function checkNod(landmarks, session) {
  const noseY = landmarks.getNose()[3].y;
  if (session.lastNoseY !== null) {
    const delta = noseY - session.lastNoseY;
    if (Math.abs(delta) > NOD_DELTA_THRESHOLD) {
      session.nodDetected = true;
    }
  }
  session.lastNoseY = noseY;
  return session.nodDetected ?? false;
}

export function detectStaticPhoto(box, session) {
  session.frameHistory.push({
    x: Math.round(box.x),
    y: Math.round(box.y),
    w: Math.round(box.width),
    h: Math.round(box.height),
    t: Date.now(),
  });

  if (session.frameHistory.length > 30) {
    session.frameHistory.shift();
  }

  if (session.frameHistory.length < 20) return false;

  const recent = session.frameHistory.slice(-20);
  const allSame = recent.every(
    (f) =>
      f.x === recent[0].x &&
      f.y === recent[0].y &&
      f.w === recent[0].w &&
      f.h === recent[0].h
  );

  if (allSame) {
    session.staticFrameCount++;
    return session.staticFrameCount > 5;
  }

  session.staticFrameCount = 0;
  return false;
}

export function evaluateLivenessStep(stepId, detection, session) {
  if (!detection?.landmarks) return false;

  const { landmarks, detection: det, expressions } = detection;
  const box = det.box;

  switch (stepId) {
    case 'blink':
      return checkBlink(landmarks, session);
    case 'turn_left':
      return checkHeadTurnLeft(landmarks, box);
    case 'turn_right':
      return checkHeadTurnRight(landmarks, box);
    case 'smile':
      return checkSmile(expressions);
    case 'nod':
      return checkNod(landmarks, session);
    default:
      return false;
  }
}

export function computeLivenessScore(session) {
  const total = LIVENESS_STEPS.length;
  const completed = session.completedSteps.length;
  const base = (completed / total) * 100;
  const penalty = session.failures.length * 10;
  const staticPenalty = session.staticFrameCount > 3 ? 20 : 0;
  return Math.max(0, Math.min(100, Math.round(base - penalty - staticPenalty)));
}

export function getLivenessResult(session) {
  const score = computeLivenessScore(session);
  const allComplete = session.completedSteps.length === LIVENESS_STEPS.length;
  const staticDetected = session.staticFrameCount > 5;

  if (staticDetected) {
    return { passed: false, score, reason: 'Static image detected — possible photo spoof' };
  }
  if (allComplete && score >= 80) {
    return { passed: true, score, reason: 'All liveness steps completed' };
  }
  if (session.failures.some((f) => f.type === 'timeout')) {
    return { passed: false, score, reason: 'Liveness check timed out' };
  }
  return {
    passed: score >= 60 && completedCount(session) >= 3,
    score,
    reason: score >= 60 ? 'Partial liveness — manual review recommended' : 'Liveness failed',
  };
}

function completedCount(session) {
  return session.completedSteps.length;
}
