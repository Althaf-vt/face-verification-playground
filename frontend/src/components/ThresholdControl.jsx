import { MATCH_THRESHOLDS } from '../biometric-engine/faceMatcher.js';
import { setThreshold } from '../utils/analyticsStore.js';

const PRESETS = [
  { label: '0.4 (Strict)', value: MATCH_THRESHOLDS.STRONG },
  { label: '0.5 (Default)', value: MATCH_THRESHOLDS.MODERATE },
  { label: '0.6 (Lenient)', value: MATCH_THRESHOLDS.WEAK },
];

export default function ThresholdControl({ value, onChange }) {
  const handleChange = (v) => {
    const num = parseFloat(v);
    onChange(num);
    setThreshold(num);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm text-gray-400">Match threshold</label>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => handleChange(p.value)}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              value === p.value
                ? 'bg-accent text-white'
                : 'bg-surface-raised text-gray-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min="0.3"
          max="0.8"
          step="0.05"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="flex-1 accent-accent"
        />
        <span className="text-sm font-mono tabular-nums w-12 text-right">{value.toFixed(2)}</span>
      </div>
    </div>
  );
}
