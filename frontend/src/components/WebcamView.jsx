import { useRef, useEffect, memo } from 'react';
import Webcam from 'react-webcam';
import DetectionOverlay from '../overlays/DetectionOverlay.jsx';
import FaceGuideOverlay from '../overlays/FaceGuideOverlay.jsx';

function WebcamView({
  webcamRef,
  videoConstraints,
  onUserMedia,
  onUserMediaError,
  overlayCanvasRef,
  showGuide = true,
  detectionState,
  mirrored = true,
  className = '',
  children,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    const syncCanvasSize = () => {
      const video = webcamRef?.current?.video;
      const canvas = overlayCanvasRef?.current;
      const container = containerRef.current;
      if (!video || !canvas || !container) return;

      const rect = container.getBoundingClientRect();
      canvas.width = video.videoWidth || rect.width;
      canvas.height = video.videoHeight || rect.height;
    };

    const video = webcamRef?.current?.video;
    if (video) {
      video.addEventListener('loadedmetadata', syncCanvasSize);
      return () => video.removeEventListener('loadedmetadata', syncCanvasSize);
    }
  }, [webcamRef, overlayCanvasRef]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl bg-black aspect-[3/4] sm:aspect-video max-h-[70vh] ${className}`}
    >
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        onUserMedia={onUserMedia}
        onUserMediaError={onUserMediaError}
        className={`w-full h-full object-cover ${mirrored ? 'scale-x-[-1]' : ''}`}
        playsInline
        muted
      />
      {overlayCanvasRef && (
        <DetectionOverlay canvasRef={overlayCanvasRef} />
      )}
      {showGuide && <FaceGuideOverlay state={detectionState} />}
      {children}
      <canvas ref={() => {}} className="hidden" aria-hidden />
    </div>
  );
}

export default memo(WebcamView);
