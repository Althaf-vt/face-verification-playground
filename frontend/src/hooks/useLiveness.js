import { useRef, useState, useCallback, useEffect } from 'react';
import {
  LIVENESS_STEPS,
  createLivenessSession,
  evaluateLivenessStep,
  detectStaticPhoto,
  computeLivenessScore,
  getLivenessResult,
} from '../biometric-engine/livenessDetector.js';
import { detectFaces } from '../biometric-engine/faceDetector.js';
import { recordLivenessAttempt } from '../utils/analyticsStore.js';

export function useLiveness({ modelsReady = false, onComplete } = {}) {
  const sessionRef = useRef(null);
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const [active, setActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [livenessScore, setLivenessScore] = useState(0);
  const [staticWarning, setStaticWarning] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const currentStep = LIVENESS_STEPS[currentStepIndex] ?? null;

  const startLiveness = useCallback(() => {
    sessionRef.current = createLivenessSession();
    sessionRef.current.status = 'active';
    setActive(true);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setLivenessScore(0);
    setStaticWarning(false);
    setTimedOut(false);
    setFinalResult(null);
  }, []);

  const finishLiveness = useCallback(
    (_success) => {
      const session = sessionRef.current;
      if (!session) return;

      session.status = 'complete';
      const result = getLivenessResult(session);
      setFinalResult(result);
      setLivenessScore(result.score);
      setActive(false);
      recordLivenessAttempt(result.passed);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
      onComplete?.(result);
    },
    [onComplete]
  );

  const completeStep = useCallback(
    (stepId) => {
      const session = sessionRef.current;
      if (!session || session.completedSteps.includes(stepId)) return;

      session.completedSteps.push(stepId);
      session.stepScores[stepId] = 100;
      setCompletedSteps([...session.completedSteps]);
      setLivenessScore(computeLivenessScore(session));

      const nextIndex = currentStepIndex + 1;
      if (nextIndex >= LIVENESS_STEPS.length) {
        finishLiveness(true);
      } else {
        setCurrentStepIndex(nextIndex);
      }
    },
    [currentStepIndex, finishLiveness]
  );

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const resetStepTimeout = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const step = LIVENESS_STEPS[currentStepIndex];
    if (!step) return;

    timeoutRef.current = setTimeout(() => {
      const session = sessionRef.current;
      session?.failures.push({ type: 'timeout', step: step.id });
      setTimedOut(true);
      if (currentStepIndex < LIVENESS_STEPS.length - 1) {
        setCurrentStepIndex((i) => i + 1);
      } else {
        finishLiveness(false);
      }
    }, step.duration);
  }, [currentStepIndex, finishLiveness]);

  useEffect(() => {
    if (active && currentStepIndex < LIVENESS_STEPS.length) {
      resetStepTimeout();
    }
  }, [active, currentStepIndex, resetStepTimeout]);

  const processFrame = useCallback(
    async (video) => {
      if (!active || !modelsReady || !video || !sessionRef.current) return;

      const detections = await detectFaces(video);
      if (!detections?.length) return;

      const detection = detections[0];
      const session = sessionRef.current;
      const step = LIVENESS_STEPS[currentStepIndex];
      if (!step) return;

      const box = detection.detection.box;
      if (detectStaticPhoto(box, session)) {
        setStaticWarning(true);
      }

      const done = evaluateLivenessStep(step.id, detection, session);
      if (done) completeStep(step.id);
      setLivenessScore(computeLivenessScore(session));
    },
    [active, modelsReady, currentStepIndex, completeStep]
  );

  const startDetectionLoop = useCallback(
    (video) => {
      if (!active) return () => {};
      resetStepTimeout();
      intervalRef.current = setInterval(() => processFrame(video), 150);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        clearTimers();
      };
    },
    [active, processFrame, resetStepTimeout]
  );

  useEffect(() => () => clearTimers(), []);

  return {
    active,
    currentStep,
    currentStepIndex,
    completedSteps,
    totalSteps: LIVENESS_STEPS.length,
    livenessScore,
    staticWarning,
    timedOut,
    finalResult,
    steps: LIVENESS_STEPS,
    startLiveness,
    finishLiveness,
    startDetectionLoop,
  };
}
