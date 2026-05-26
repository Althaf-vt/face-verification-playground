/**
 * Lighting quality analysis from video/canvas frames.
 * Heuristic estimates for QA — not calibrated photometry.
 */

export function analyzeLighting(canvas, ctx) {
  if (!canvas || !ctx) {
    return {
      brightness: 0,
      isLowLight: true,
      isOverexposed: false,
      quality: 'unknown',
      score: 0,
    };
  }

  const { width, height } = canvas;
  const sampleW = Math.min(160, width);
  const sampleH = Math.min(120, height);

  const imageData = ctx.getImageData(
    Math.floor((width - sampleW) / 2),
    Math.floor((height - sampleH) / 2),
    sampleW,
    sampleH
  );

  const pixels = imageData.data;
  let totalLuminance = 0;
  let darkPixels = 0;
  let brightPixels = 0;
  const pixelCount = pixels.length / 4;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    totalLuminance += lum;
    if (lum < 40) darkPixels++;
    if (lum > 220) brightPixels++;
  }

  const avgBrightness = totalLuminance / pixelCount;
  const darkRatio = darkPixels / pixelCount;
  const brightRatio = brightPixels / pixelCount;

  const isLowLight = avgBrightness < 55 || darkRatio > 0.5;
  const isOverexposed = avgBrightness > 200 || brightRatio > 0.45;

  let quality = 'good';
  let score = 100;

  if (isLowLight) {
    quality = 'low';
    score = Math.round((avgBrightness / 55) * 50);
  } else if (isOverexposed) {
    quality = 'overexposed';
    score = Math.max(20, 100 - Math.round(brightRatio * 100));
  } else if (avgBrightness < 80) {
    quality = 'fair';
    score = 70;
  }

  return {
    brightness: Math.round(avgBrightness),
    isLowLight,
    isOverexposed,
    darkRatio: Math.round(darkRatio * 100),
    brightRatio: Math.round(brightRatio * 100),
    quality,
    score,
    label: getLightingLabel(quality, isLowLight, isOverexposed),
  };
}

function getLightingLabel(quality, isLowLight, isOverexposed) {
  if (isLowLight) return 'Low lighting';
  if (isOverexposed) return 'Overexposed';
  if (quality === 'fair') return 'Suboptimal lighting';
  return 'Good lighting';
}

export function isFacePartiallyVisible(detections, canvasWidth, canvasHeight) {
  if (!detections?.length) return false;
  const box = detections[0].detection.box;
  const margin = 10;
  return (
    box.x < margin ||
    box.y < margin ||
    box.x + box.width > canvasWidth - margin ||
    box.y + box.height > canvasHeight - margin
  );
}
