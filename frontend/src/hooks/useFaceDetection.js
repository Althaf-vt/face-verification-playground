import { useRef, useCallback, useEffect, useState } from 'react';
import {
  detectFaces,
  classifyDetectionState,
  getDetectionConfidence,
  DETECTION_STATES,
} from '../biometric-engine/faceDetector.js';
import { analyzeLighting, isFacePartiallyVisible } from '../biometric-engine/lightingAnalyzer.js';
import { PerformanceMonitor } from '../utils/performanceMonitor.js';
import { faceapi } from '../biometric-engine/modelLoader.js';

const STATE_LABELS = {
  [DETECTION_STATES.NO_FACE]: 'No face detected',
  [DETECTION_STATES.FACE_DETECTED]: 'Face detected',
  [DETECTION_STATES.MULTIPLE_FACES]: 'Multiple faces detected',
  [DETECTION_STATES.LOW_LIGHTING]: 'Low lighting',
  [DETECTION_STATES.FACE_TOO_FAR]: 'Face too far',
  [DETECTION_STATES.FACE_TOO_CLOSE]: 'Face too close',
};

export function useFaceDetection({ enabled = true, modelsReady = false, inputSize = 416 } = {}) {
  const perfRef = useRef(new PerformanceMonitor());
  const rafRef = useRef(null);
  const runningRef = useRef(false);

  const [detections, setDetections] = useState([]);
  const [detectionState, setDetectionState] = useState(DETECTION_STATES.NO_FACE);
  const [confidence, setConfidence] = useState(0);
  const [lighting, setLighting] = useState(null);
  const [partialFace, setPartialFace] = useState(false);
  const [perfStats, setPerfStats] = useState(perfRef.current.getSnapshot());

  const detectLoop = useCallback(
    async (video, overlayCanvas, lightingCanvas) => {
      if (!video || video.readyState < 2 || !modelsReady || runningRef.current) return;

      runningRef.current = true;
      const start = performance.now();

      try {
        let lightingResult = null;
        if (lightingCanvas) {
          const lCtx = lightingCanvas.getContext('2d', { willReadFrequently: true });
          lCtx.drawImage(video, 0, 0, lightingCanvas.width, lightingCanvas.height);
          lightingResult = analyzeLighting(lightingCanvas, lCtx);
          setLighting(lightingResult);
        }

        const results = await detectFaces(video, { inputSize });
        const state = classifyDetectionState(results, lightingResult);
        const conf = getDetectionConfidence(results);

        const w = video.videoWidth || 640;
        const h = video.videoHeight || 480;
        const partial = isFacePartiallyVisible(results, w, h);

        setDetections(results);
        setDetectionState(state);
        setConfidence(conf);
        setPartialFace(partial);

        if (overlayCanvas && results.length) {
          const displaySize = { width: video.videoWidth, height: video.videoHeight };
          faceapi.matchDimensions(overlayCanvas, displaySize);
          const resized = faceapi.resizeResults(results, displaySize);
          const ctx = overlayCanvas.getContext('2d');
          ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
          faceapi.draw.drawDetections(overlayCanvas, resized);
          faceapi.draw.drawFaceLandmarks(overlayCanvas, resized);
        } else if (overlayCanvas) {
          const ctx = overlayCanvas.getContext('2d');
          ctx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        }

        const latency = performance.now() - start;
        perfRef.current.recordDetection(latency, true);
      } catch {
        perfRef.current.recordDetection(0, false);
      } finally {
        runningRef.current = false;
        perfRef.current.tickFrame();
        setPerfStats(perfRef.current.getSnapshot());
      }
    },
    [modelsReady, inputSize]
  );

  const startDetection = useCallback(
    (video, overlayCanvas, lightingCanvas) => {
      if (!enabled || !modelsReady) return () => {};

      const loop = () => {
        detectLoop(video, overlayCanvas, lightingCanvas);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);

      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      };
    },
    [enabled, modelsReady, detectLoop]
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return {
    detections,
    detectionState,
    stateLabel: STATE_LABELS[detectionState] || detectionState,
    confidence,
    lighting,
    partialFace,
    perfStats,
    perfMonitor: perfRef.current,
    startDetection,
    hasMultipleFaces: detectionState === DETECTION_STATES.MULTIPLE_FACES,
  };
}
