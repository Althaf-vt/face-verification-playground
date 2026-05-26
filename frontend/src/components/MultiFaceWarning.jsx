export default function MultiFaceWarning({ visible, faceCount = 0 }) {
  if (!visible) return null;

  return (
    <div className="absolute inset-x-0 top-4 z-20 flex justify-center px-4 animate-pulse">
      <div className="glass-card border-accent-danger/50 bg-accent-danger/10 px-4 py-3 max-w-md text-center">
        <p className="text-sm font-medium text-accent-danger">
          Multiple faces detected ({faceCount})
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Verification blocked — only one person should be visible
        </p>
      </div>
    </div>
  );
}
