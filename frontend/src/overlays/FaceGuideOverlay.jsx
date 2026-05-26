import { memo } from 'react';

function FaceGuideOverlay({ state, visible = true }) {
  if (!visible) return null;

  const borderColor =
    state === 'face_detected'
      ? 'border-accent-success/60 shadow-glow-success'
      : state === 'multiple_faces'
        ? 'border-accent-danger/60 shadow-glow-danger'
        : 'border-accent/40 shadow-glow';

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div
        className={`w-[min(70%,280px)] aspect-[3/4] rounded-[50%] border-2 ${borderColor} transition-all duration-500`}
        style={{
          boxShadow: 'inset 0 0 60px rgba(99, 102, 241, 0.08)',
        }}
      />
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <div className="h-1 w-24 rounded-full bg-gradient-to-r from-transparent via-accent/50 to-transparent animate-pulse-slow" />
      </div>
    </div>
  );
}

export default memo(FaceGuideOverlay);
