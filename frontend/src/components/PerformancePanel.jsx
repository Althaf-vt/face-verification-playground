import StatCard from './StatCard.jsx';

export default function PerformancePanel({ stats, resolution, lighting }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      <StatCard label="FPS" value={stats?.fps ?? '—'} />
      <StatCard
        label="Detection latency"
        value={stats?.avgDetectionLatency ?? '—'}
        unit="ms"
      />
      <StatCard
        label="Failures"
        value={stats?.detectionFailures ?? 0}
        subtext={`${stats?.failureRate ?? 0}% failure rate`}
      />
      <StatCard
        label="CPU estimate"
        value={stats?.cpuEstimate ?? '—'}
        unit="%"
      />
      {resolution && (
        <StatCard
          label="Webcam resolution"
          value={`${resolution.width}×${resolution.height}`}
        />
      )}
      {lighting && (
        <StatCard
          label="Lighting"
          value={lighting.brightness}
          subtext={lighting.label}
        />
      )}
    </div>
  );
}
