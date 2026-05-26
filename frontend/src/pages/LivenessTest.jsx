import { useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { useFaceApiModels } from '../hooks/useFaceApiModels.js';
import { useWebcam } from '../hooks/useWebcam.js';
import { useLiveness } from '../hooks/useLiveness.js';
import StatusBadge from '../components/StatusBadge.jsx';

export default function LivenessTest() {
  const { ready } = useFaceApiModels();
  const { webcamRef, videoConstraints, onUserMedia, onUserMediaError } = useWebcam();

  const {
    active,
    currentStep,
    currentStepIndex,
    completedSteps,
    totalSteps,
    livenessScore,
    staticWarning,
    timedOut,
    finalResult,
    steps,
    startLiveness,
    startDetectionLoop,
  } = useLiveness({ modelsReady: ready });

  useEffect(() => {
    if (!active || !ready) return;
    const video = webcamRef.current?.video;
    if (!video) return;
    return startDetectionLoop(video);
  }, [active, ready, startDetectionLoop, webcamRef]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Liveness Detection Test</h2>
        <p className="text-sm text-gray-500">
          Step-by-step liveness: blink, head turns, smile, nod. Includes anti-static-photo
          heuristics (not spoof-proof).
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="relative rounded-2xl overflow-hidden aspect-[3/4] sm:aspect-video bg-black max-h-[60vh]">
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
          {active && currentStep && (
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
              <p className="text-center text-lg font-medium">{currentStep.label}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {!active && !finalResult && (
            <button
              type="button"
              onClick={startLiveness}
              disabled={!ready}
              className="w-full py-3 rounded-xl bg-accent hover:bg-accent-glow disabled:opacity-40 font-medium"
            >
              Start liveness check
            </button>
          )}

          <div className="glass-card p-4">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-gray-400">Progress</span>
              <span>
                {completedSteps.length} / {totalSteps}
              </span>
            </div>
            <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-accent-success transition-all duration-500"
                style={{ width: `${(completedSteps.length / totalSteps) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">Liveness score: {livenessScore}%</p>
          </div>

          <ul className="space-y-2">
            {steps.map((step, i) => {
              const done = completedSteps.includes(step.id);
              const current = i === currentStepIndex && active;
              return (
                <li
                  key={step.id}
                  className={`flex items-center gap-3 p-3 rounded-xl text-sm ${
                    done
                      ? 'bg-accent-success/10 text-accent-success'
                      : current
                        ? 'bg-accent/10 text-accent-glow ring-1 ring-accent/30'
                        : 'bg-surface-raised text-gray-500'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs border border-current">
                    {done ? '✓' : i + 1}
                  </span>
                  {step.label}
                </li>
              );
            })}
          </ul>

          {staticWarning && (
            <p className="text-xs text-accent-warning">
              Static image suspected — move naturally
            </p>
          )}
          {timedOut && (
            <p className="text-xs text-accent-danger">Step timed out — continuing</p>
          )}

          {finalResult && (
            <div className="glass-card p-4 space-y-2">
              <StatusBadge
                label={finalResult.passed ? 'Liveness passed' : 'Liveness failed'}
                variant={finalResult.passed ? 'success' : 'danger'}
              />
              <p className="text-sm text-gray-400">{finalResult.reason}</p>
              <p className="text-2xl font-semibold">{finalResult.score}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
