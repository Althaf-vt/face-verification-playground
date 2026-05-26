const variants = {
  success: 'bg-accent-success/15 text-accent-success border-accent-success/30',
  warning: 'bg-accent-warning/15 text-accent-warning border-accent-warning/30',
  danger: 'bg-accent-danger/15 text-accent-danger border-accent-danger/30',
  info: 'bg-accent/15 text-accent-glow border-accent/30',
  neutral: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
};

export default function StatusBadge({ label, variant = 'neutral', pulse = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${variants[variant]} ${pulse ? 'animate-pulse' : ''}`}
    >
      <span
        className={`status-dot ${variant === 'success' ? 'bg-accent-success' : variant === 'danger' ? 'bg-accent-danger' : variant === 'warning' ? 'bg-accent-warning' : 'bg-accent-glow'}`}
      />
      {label}
    </span>
  );
}
