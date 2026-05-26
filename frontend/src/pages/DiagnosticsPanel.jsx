import { useState, useEffect } from 'react';
import { getAnalyticsState, subscribe } from '../utils/analyticsStore.js';
import { listStoredFiles, clearTempStorage, getLogs } from '../services/api.js';
import StatCard from '../components/StatCard.jsx';
import { useFaceApiModels } from '../hooks/useFaceApiModels.js';
import { PerformanceMonitor } from '../utils/performanceMonitor.js';

const perfMonitor = new PerformanceMonitor();

export default function DiagnosticsPanel() {
  const { ready } = useFaceApiModels();
  const [analytics, setAnalytics] = useState(getAnalyticsState());
  const [files, setFiles] = useState([]);
  const [logs, setLogs] = useState([]);
  const [perf, setPerf] = useState(perfMonitor.getSnapshot());

  useEffect(() => {
    return subscribe(setAnalytics);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const [fileList, logList] = await Promise.all([listStoredFiles(), getLogs(20)]);
        setFiles(fileList.files || []);
        setLogs(logList.logs || []);
      } catch {
        /* backend may be offline */
      }
    };
    load();
    const id = setInterval(() => {
      perfMonitor.tickFrame();
      setPerf(perfMonitor.getSnapshot());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const handleClear = async () => {
    if (!confirm('Clear all temp storage?')) return;
    await clearTempStorage();
    setFiles([]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-1">Test Analytics & Diagnostics</h2>
        <p className="text-sm text-gray-500">
          Session metrics, local temp storage inventory, and verification logs.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard label="Detection FPS" value={perf.fps || '—'} />
        <StatCard
          label="Avg descriptor distance"
          value={perf.avgDescriptorDistance ?? '—'}
        />
        <StatCard
          label="Liveness success rate"
          value={analytics.livenessSuccessRate}
          unit="%"
        />
        <StatCard label="Current threshold" value={analytics.threshold} />
        <StatCard
          label="Webcam resolution"
          value={
            analytics.webcamResolution
              ? `${analytics.webcamResolution.width}×${analytics.webcamResolution.height}`
              : '—'
          }
        />
        <StatCard label="Detection latency" value={perf.avgDetectionLatency || '—'} unit="ms" />
        <StatCard label="CPU usage estimate" value={perf.cpuEstimate || '—'} unit="%" />
        <StatCard label="Detection failures" value={perf.detectionFailures} />
        <StatCard label="Match attempts" value={analytics.matchAttempts} />
        <StatCard label="Models loaded" value={ready ? 'Yes' : 'No'} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass-card p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Local temp files</h3>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-accent-danger hover:underline"
            >
              Clear all
            </button>
          </div>
          {files.length === 0 ? (
            <p className="text-xs text-gray-600">No files stored yet</p>
          ) : (
            <ul className="space-y-1 max-h-48 overflow-y-auto text-xs font-mono text-gray-400">
              {files.map((f) => (
                <li key={f.id}>{f.filename}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-card p-4">
          <h3 className="text-sm font-medium mb-3">Recent logs</h3>
          {logs.length === 0 ? (
            <p className="text-xs text-gray-600">No logs yet</p>
          ) : (
            <ul className="space-y-2 max-h-48 overflow-y-auto text-xs text-gray-500">
              {logs.map((log, i) => (
                <li key={i} className="border-b border-surface-border/50 pb-1">
                  {log.timestamp} — {log.type}: {log.result || JSON.stringify(log).slice(0, 60)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="glass-card p-4 text-xs text-gray-600">
        <p className="font-medium text-gray-400 mb-2">Mobile performance notes</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Use portrait mode for optimal face framing on phones</li>
          <li>Android Chrome: grant camera permission when prompted</li>
          <li>Lower inputSize (320) improves FPS on low-end devices</li>
          <li>Detection loops use requestAnimationFrame with async guard to prevent overlap</li>
        </ul>
      </div>
    </div>
  );
}
