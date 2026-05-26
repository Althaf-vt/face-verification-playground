import { useState, useEffect, useCallback } from 'react';
import { loadModels, areModelsLoaded } from '../biometric-engine/modelLoader.js';

export function useFaceApiModels() {
  const [loading, setLoading] = useState(!areModelsLoaded());
  const [progress, setProgress] = useState({ stage: 'idle', progress: 0 });
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(areModelsLoaded());

  const load = useCallback(async () => {
    if (areModelsLoaded()) {
      setReady(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await loadModels(setProgress);
      setReady(true);
    } catch (err) {
      setError(err.message);
      setReady(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { loading, progress, error, ready, reload: load };
}
