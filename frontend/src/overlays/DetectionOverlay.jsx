import { memo } from 'react';

/**
 * Canvas overlay container for face-api draw calls.
 * Positioned absolutely over the webcam feed.
 */
function DetectionOverlay({ canvasRef, className = '' }) {
  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ transform: 'scaleX(-1)' }}
    />
  );
}

export default memo(DetectionOverlay);
