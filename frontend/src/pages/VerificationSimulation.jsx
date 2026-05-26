import { useState, useCallback, useRef } from 'react';
import Webcam from 'react-webcam';
import { useFaceApiModels } from '../hooks/useFaceApiModels.js';
import { useWebcam } from '../hooks/useWebcam.js';
import { useLiveness } from '../hooks/useLiveness.js';
import { detectSingleFaceWithDescriptor, detectFaces, hasMultipleFaces } from '../biometric-engine/faceDetector.js';
import { compareDescriptors, MATCH_THRESHOLDS } from '../biometric-engine/faceMatcher.js';
import { evaluateVerification, VERIFICATION_RESULTS } from '../biometric-engine/verificationEngine.js';
import { uploadImage, saveCapture, appendLog } from '../services/api.js';
import MultiFaceWarning from '../components/MultiFaceWarning.jsx';
import StatusBadge from '../components/StatusBadge.jsx';

const STEPS = ['upload', 'webcam', 'capture', 'match', 'liveness', 'result'];
const resultVariant = {
  [VERIFICATION_RESULTS.AUTO_APPROVED]: 'success',
  [VERIFICATION_RESULTS.MANUAL_REVIEW]: 'warning',
  [VERIFICATION_RESULTS.REJECTED]: 'danger',
};

export default function VerificationSimulation() {
  const { ready } = useFaceApiModels();
  const [flowStep, setFlowStep] = useState(0);
  const [kycImage, setKycImage] = useState(null);
  const [refDescriptor, setRefDescriptor] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [finalVerification, setFinalVerification] = useState(null);
  const [multiFace, setMultiFace] = useState(false);
  const [loading, setLoading] = useState(false);
  const matchResultRef = useRef(null);

  const { webcamRef, videoConstraints, onUserMedia, onUserMediaError, captureScreenshot } =
    useWebcam();

  const liveness = useLiveness({
    modelsReady: ready,
    onComplete: (result) => {
      const verification = evaluateVerification({
        matchResult: matchResultRef.current,
        livenessSession: { livenessScore: result.score, completedSteps: [] },
        multiFaceDetected: multiFace,
        livenessPassed: result.passed,
      });
      setFinalVerification(verification);
      setFlowStep(5);
      appendLog({
        type: 'verification',
        result: verification.result,
        timestamp: new Date().toISOString(),
      }).catch(() => {});
    },
  });

  const currentStepId = STEPS[flowStep];

  const handleKycUpload = async (file) => {
    setLoading(true);
    try {
      const url = URL.createObjectURL(file);
      setKycImage(url);
      const img = new Image();
      img.src = url;
      await new Promise((r) => (img.onload = r));
      const det = await detectSingleFaceWithDescriptor(img);
      if (!det) throw new Error('No face in KYC image');
      setRefDescriptor(det.descriptor);
      await uploadImage(file, 'kyc');
      setFlowStep(1);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCapture = useCallback(async () => {
    setLoading(true);
    try {
      const screenshot = captureScreenshot();
      const img = new Image();
      img.src = screenshot;
      await new Promise((r) => (img.onload = r));

      const multi = await detectFaces(img);
      if (hasMultipleFaces(multi)) {
        setMultiFace(true);
        return;
      }
      setMultiFace(false);

      const live = await detectSingleFaceWithDescriptor(img);
      if (!live || !refDescriptor) throw new Error('Face detection failed');

      const result = compareDescriptors(
        refDescriptor,
        live.descriptor,
        MATCH_THRESHOLDS.MODERATE
      );
      setMatchResult(result);
      matchResultRef.current = result;
      setFlowStep(3);

      const blob = await (await fetch(screenshot)).blob();
      await saveCapture(blob, 'verification-capture');
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }, [captureScreenshot, refDescriptor]);

  const startLivenessFlow = () => {
    liveness.startLiveness();
    setFlowStep(4);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Full Verification Simulation</h2>
        <p className="text-sm text-gray-500">
          Simulates matrimony onboarding: KYC upload → live capture → match → liveness →
          Auto Approved / Manual Review / Rejected.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${
              i <= flowStep ? 'bg-accent/20 text-accent-glow' : 'bg-surface-raised text-gray-600'
            }`}
          >
            {i + 1}. {s}
          </div>
        ))}
      </div>

      {currentStepId === 'upload' && (
        <label className="block glass-card p-8 text-center cursor-pointer border-dashed border-2 border-surface-border">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleKycUpload(e.target.files[0])}
          />
          {kycImage ? (
            <img src={kycImage} alt="KYC" className="max-h-40 mx-auto rounded-lg" />
          ) : (
            <p className="text-gray-500">Upload KYC / selfie image</p>
          )}
        </label>
      )}

      {(currentStepId === 'webcam' || currentStepId === 'capture') && (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-black max-h-[50vh]">
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
            <MultiFaceWarning visible={multiFace} />
          </div>
          {currentStepId === 'webcam' && (
            <button
              type="button"
              onClick={() => setFlowStep(2)}
              className="w-full py-2.5 rounded-xl bg-accent text-sm font-medium"
            >
              Webcam ready — continue
            </button>
          )}
          {currentStepId === 'capture' && (
            <button
              type="button"
              disabled={loading || !ready}
              onClick={handleCapture}
              className="w-full py-2.5 rounded-xl bg-accent text-sm font-medium disabled:opacity-40"
            >
              Capture & compare
            </button>
          )}
        </div>
      )}

      {currentStepId === 'match' && matchResult && (
        <div className="glass-card p-4 space-y-3">
          <p className="text-sm">
            Match: {matchResult.classification.label} — distance {matchResult.distance.toFixed(4)}
          </p>
          <button
            type="button"
            onClick={startLivenessFlow}
            className="w-full py-2.5 rounded-xl bg-accent text-sm font-medium"
          >
            Run liveness check
          </button>
        </div>
      )}

      {flowStep === 4 && liveness.active && (
        <div className="glass-card p-4">
          <p className="text-sm mb-2">{liveness.currentStep?.label}</p>
          <div className="h-2 bg-surface-raised rounded-full">
            <div
              className="h-full bg-accent-success rounded-full transition-all"
              style={{
                width: `${(liveness.completedSteps.length / liveness.totalSteps) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {currentStepId === 'result' && finalVerification && (
        <div className="glass-card p-8 text-center space-y-4">
          <StatusBadge
            label={finalVerification.result}
            variant={resultVariant[finalVerification.result]}
          />
          <p className="text-gray-400 text-sm">{finalVerification.reason}</p>
          {matchResult && (
            <p className="text-xs text-gray-600">
              Similarity: {matchResult.similarityPercent}% · Liveness score:{' '}
              {liveness.livenessScore}%
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setFlowStep(0);
              setFinalVerification(null);
              setMatchResult(null);
              setKycImage(null);
            }}
            className="text-sm text-accent-glow hover:underline"
          >
            Run again
          </button>
        </div>
      )}
    </div>
  );
}
