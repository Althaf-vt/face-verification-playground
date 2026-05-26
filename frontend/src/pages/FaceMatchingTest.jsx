import { useState, useRef, useCallback } from 'react';
import { useFaceApiModels } from '../hooks/useFaceApiModels.js';
import { useWebcam } from '../hooks/useWebcam.js';
import { detectSingleFaceWithDescriptor, hasMultipleFaces, detectFaces } from '../biometric-engine/faceDetector.js';
import { compareDescriptors, MATCH_THRESHOLDS } from '../biometric-engine/faceMatcher.js';
import { recordMatchAttempt } from '../utils/analyticsStore.js';
import { uploadImage, saveCapture } from '../services/api.js';
import ThresholdControl from '../components/ThresholdControl.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import MultiFaceWarning from '../components/MultiFaceWarning.jsx';
import Webcam from 'react-webcam';

const matchVariant = {
  strong: 'success',
  moderate: 'info',
  weak: 'warning',
  none: 'danger',
};

export default function FaceMatchingTest() {
  const { ready } = useFaceApiModels();
  const [threshold, setThresholdValue] = useState(MATCH_THRESHOLDS.MODERATE);
  const [referenceImg, setReferenceImg] = useState(null);
  const [referenceDescriptor, setReferenceDescriptor] = useState(null);
  const [liveDescriptor, setLiveDescriptor] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [multiFace, setMultiFace] = useState(false);
  const [refConfidence, setRefConfidence] = useState(0);
  const [liveConfidence, setLiveConfidence] = useState(0);

  const refImageRef = useRef(null);
  const { webcamRef, videoConstraints, onUserMedia, onUserMediaError, captureScreenshot } =
    useWebcam();

  const loadReference = async (file) => {
    setError(null);
    setLoading(true);
    try {
      const url = URL.createObjectURL(file);
      setReferenceImg(url);

      const img = new Image();
      img.src = url;
      await new Promise((r) => (img.onload = r));

      const multi = await detectFaces(img);
      if (hasMultipleFaces(multi)) {
        setError('Reference image contains multiple faces');
        setLoading(false);
        return;
      }

      const detection = await detectSingleFaceWithDescriptor(img);
      if (!detection) {
        setError('No face found in reference image');
        setLoading(false);
        return;
      }

      setReferenceDescriptor(detection.descriptor);
      setRefConfidence(detection.detection.score);
      await uploadImage(file, 'reference');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const captureAndCompare = useCallback(async () => {
    if (!referenceDescriptor || !ready) return;
    setError(null);
    setLoading(true);
    setMatchResult(null);

    try {
      const screenshot = captureScreenshot();
      if (!screenshot) throw new Error('Failed to capture webcam frame');

      const img = new Image();
      img.src = screenshot;
      await new Promise((r) => (img.onload = r));

      const multi = await detectFaces(img);
      if (hasMultipleFaces(multi)) {
        setMultiFace(true);
        setError('Multiple faces detected — matching blocked');
        setLoading(false);
        return;
      }
      setMultiFace(false);

      const detection = await detectSingleFaceWithDescriptor(img);
      if (!detection) {
        setError('No face detected in live capture');
        setLoading(false);
        return;
      }

      setLiveDescriptor(detection.descriptor);
      setLiveConfidence(detection.detection.score);

      const result = compareDescriptors(
        referenceDescriptor,
        detection.descriptor,
        threshold
      );
      setMatchResult(result);
      recordMatchAttempt();

      const blob = await (await fetch(screenshot)).blob();
      await saveCapture(blob, 'match-capture');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [referenceDescriptor, ready, captureScreenshot, threshold]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Face Matching Test</h2>
        <p className="text-sm text-gray-500">
          Upload a reference image and compare against a live webcam capture via euclidean
          descriptor distance.
        </p>
      </div>

      <div className="glass-card p-4">
        <ThresholdControl value={threshold} onChange={setThresholdValue} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-400">Reference image</h3>
          <label className="block">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && loadReference(e.target.files[0])}
            />
            <div className="glass-card border-dashed border-2 border-surface-border p-8 text-center cursor-pointer hover:border-accent/40 transition-colors">
              {referenceImg ? (
                <img
                  ref={refImageRef}
                  src={referenceImg}
                  alt="Reference"
                  className="max-h-48 mx-auto rounded-lg"
                />
              ) : (
                <p className="text-sm text-gray-500">Click to upload reference photo</p>
              )}
            </div>
          </label>
          {refConfidence > 0 && (
            <p className="text-xs text-gray-500">
              Ref detection confidence: {(refConfidence * 100).toFixed(1)}%
            </p>
          )}
        </div>

        <div className="space-y-4 relative">
          <h3 className="text-sm font-medium text-gray-400">Live capture</h3>
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-black">
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
          <button
            type="button"
            disabled={!referenceDescriptor || !ready || loading}
            onClick={captureAndCompare}
            className="w-full py-2.5 rounded-xl bg-accent hover:bg-accent-glow disabled:opacity-40 text-sm font-medium transition-colors"
          >
            {loading ? 'Processing…' : 'Capture & Compare'}
          </button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-accent-danger glass-card p-3 border-accent-danger/30">
          {error}
        </div>
      )}

      {matchResult && (
        <div className="glass-card p-6 glow-border space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-medium">Match result</h3>
            <StatusBadge
              label={matchResult.classification.label}
              variant={matchVariant[matchResult.classification.tier]}
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500 text-xs">Descriptor distance</p>
              <p className="text-xl font-mono">{matchResult.distance.toFixed(4)}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Similarity</p>
              <p className="text-xl font-mono">{matchResult.similarityPercent}%</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs">Match confidence</p>
              <p className="text-xl font-mono">{matchResult.matchConfidence}%</p>
            </div>
          </div>
          {liveConfidence > 0 && (
            <p className="text-xs text-gray-500">
              Live detection confidence: {(liveConfidence * 100).toFixed(1)}%
            </p>
          )}
        </div>
      )}
    </div>
  );
}
