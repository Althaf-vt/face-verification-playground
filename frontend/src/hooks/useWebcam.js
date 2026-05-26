import { useRef, useCallback, useEffect, useState } from 'react';
import { setWebcamResolution } from '../utils/analyticsStore.js';

/**
 * Webcam lifecycle hook with proper stream cleanup to avoid memory leaks.
 */
export function useWebcam(options = {}) {
  const webcamRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [resolution, setResolution] = useState(null);
  const [facingMode, setFacingMode] = useState(options.facingMode || 'user');

  const videoConstraints = {
    width: { ideal: options.width ?? 1280, max: 1920 },
    height: { ideal: options.height ?? 720, max: 1080 },
    facingMode,
    ...(options.advancedConstraints || {}),
  };

  const onUserMedia = useCallback((stream) => {
    const track = stream?.getVideoTracks?.()?.[0];
    const settings = track?.getSettings?.();
    if (settings?.width && settings?.height) {
      const res = { width: settings.width, height: settings.height };
      setResolution(res);
      setWebcamResolution(settings.width, settings.height);
    }
    setIsReady(true);
  }, []);

  const onUserMediaError = useCallback((err) => {
    console.error('Webcam error:', err);
    setIsReady(false);
  }, []);

  const stopStream = useCallback(() => {
    const stream = webcamRef.current?.stream;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsReady(false);
  }, []);

  const captureScreenshot = useCallback(() => {
    return webcamRef.current?.getScreenshot?.() ?? null;
  }, []);

  const getVideoElement = useCallback(() => {
    return webcamRef.current?.video;
  }, []);

  const switchCamera = useCallback(() => {
    stopStream();
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  }, [stopStream]);

  useEffect(() => {
    return () => stopStream();
  }, [stopStream]);

  return {
    webcamRef,
    videoConstraints,
    isReady,
    resolution,
    facingMode,
    onUserMedia,
    onUserMediaError,
    stopStream,
    captureScreenshot,
    getVideoElement,
    switchCamera,
  };
}
