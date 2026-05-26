export default function StatCard({ label, value, unit, subtext, loading = false }) {
  return (
    <div className="glass-card p-4 transition-all duration-300 hover:border-accent/20">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      {loading ? (
        <div className="skeleton h-8 w-20 mt-1" />
      ) : (
        <>
          <p className="text-2xl font-semibold tabular-nums">
            {value}
            {unit && <span className="text-sm text-gray-500 ml-1">{unit}</span>}
          </p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </>
      )}
    </div>
  );
}
