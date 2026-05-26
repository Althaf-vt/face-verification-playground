import { useFaceApiModels } from '../hooks/useFaceApiModels.js';

export default function ModelLoaderStatus() {
  const { loading, ready, error, progress } = useFaceApiModels();

  if (error) {
    return (
      <span className="text-xs text-accent-danger flex items-center gap-1.5">
        <span className="status-dot bg-accent-danger" />
        Models failed
      </span>
    );
  }

  if (loading) {
    return (
      <span className="text-xs text-gray-400 flex items-center gap-1.5">
        <span className="status-dot bg-accent-warning animate-pulse" />
        Loading {progress.progress}%
      </span>
    );
  }

  if (ready) {
    return (
      <span className="text-xs text-accent-success flex items-center gap-1.5">
        <span className="status-dot bg-accent-success" />
        Models ready
      </span>
    );
  }

  return null;
}
