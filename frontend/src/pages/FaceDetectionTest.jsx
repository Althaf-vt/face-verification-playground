import { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useFaceApiModels } from '../hooks/useFaceApiModels.js';
import { useWebcam } from '../hooks/useWebcam.js';
import { useFaceDetection } from '../hooks/useFaceDetection.js';
import { DETECTION_STATES } from '../biometric-engine/faceDetector.js';
import StatusBadge from '../components/StatusBadge.jsx';
import PerformancePanel from '../components/PerformancePanel.jsx';
import MultiFaceWarning from '../components/MultiFaceWarning.jsx';
import DetectionOverlay from '../overlays/DetectionOverlay.jsx';
import FaceGuideOverlay from '../overlays/FaceGuideOverlay.jsx';

const stateVariant = {
  [DETECTION_STATES.FACE_DETECTED]: 'success',
  [DETECTION_STATES.NO_FACE]: 'neutral',
  [DETECTION_STATES.MULTIPLE_FACES]: 'danger',
  [DETECTION_STATES.LOW_LIGHTING]: 'warning',
  [DETECTION_STATES.FACE_TOO_FAR]: 'warning',
  [DETECTION_STATES.FACE_TOO_CLOSE]: 'warning',
};

export default function FaceDetectionTest() {
  const { ready } = useFaceApiModels();
  const overlayRef = useRef(null);
  const lightingCanvasRef = useRef(null);
  const containerRef = useRef(null);

  const {
    webcamRef,
    videoConstraints,
    onUserMedia,
    onUserMediaError,
    resolution,
    switchCamera,
  } = useWebcam({ width: 1280, height: 720 });

  const {
    detectionState,
    stateLabel,
    confidence,
    lighting,
    partialFace,
    perfStats,
    startDetection,
    hasMultipleFaces,
    detections,
  } = useFaceDetection({ enabled: true, modelsReady: ready });

  useEffect(() => {
    if (!ready) return;
    const video = webcamRef.current?.video;
    const canvas = overlayRef.current;
    const lCanvas = lightingCanvasRef.current;
    if (!video) return;

    const cleanup = startDetection(video, canvas, lCanvas);
    return cleanup;
  }, [ready, startDetection, webcamRef]);

  useEffect(() => {
    const sync = () => {
      const video = webcamRef.current?.video;
      const canvas = overlayRef.current;
      if (video && canvas) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }
    };
    const video = webcamRef.current?.video;
    video?.addEventListener('loadedmetadata', sync);
    return () => video?.removeEventListener('loadedmetadata', sync);
  }, [webcamRef]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Face Detection Test</h2>
        <p className="text-sm text-gray-500">
          Realtime detection with bounding boxes, landmarks, confidence, and lighting analysis.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div
            ref={containerRef}
            className="relative overflow-hidden rounded-2xl bg-black aspect-[3/4] sm:aspect-video max-h-[70vh]"
          >
            <Webcam
              ref={webcamRef}
              audio={false}
              videoConstraints={videoConstraints}
              onUserMedia={onUserMedia}
              onUserMediaError={onUserMediaError}
              className="w-full h-full object-cover scale-x-[-1]"
              playsInline
              muted
            />
            <DetectionOverlay canvasRef={overlayRef} />
            <FaceGuideOverlay state={detectionState.replace('_', ' ')} />
            <MultiFaceWarning
              visible={hasMultipleFaces}
              faceCount={detections?.length ?? 0}
            />
            <canvas ref={lightingCanvasRef} className="hidden" width={160} height={120} />
          </div>

          <button
            type="button"
            onClick={switchCamera}
            className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg bg-surface-raised"
          >
            Switch camera
          </button>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-4 space-y-3">
            <h3 className="text-sm font-medium text-gray-300">Detection status</h3>
            <StatusBadge
              label={stateLabel}
              variant={stateVariant[detectionState] || 'neutral'}
              pulse={detectionState === DETECTION_STATES.FACE_DETECTED}
            />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Confidence</span>
                <span className="font-mono">{(confidence * 100).toFixed(1)}%</span>
              </div>
              {lighting && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Lighting</span>
                  <span>{lighting.label}</span>
                </div>
              )}
              {partialFace && (
                <p className="text-xs text-accent-warning">Face partially out of frame</p>
              )}
              {lighting?.isOverexposed && (
                <p className="text-xs text-accent-warning">Overexposure detected</p>
              )}
            </div>
          </div>

          <PerformancePanel stats={perfStats} resolution={resolution} lighting={lighting} />
        </div>
      </div>
    </div>
  );
}
