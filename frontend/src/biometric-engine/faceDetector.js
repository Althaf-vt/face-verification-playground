/**
 * Face detection pipeline for realtime QA testing.
 * NOT enterprise biometric security — MVP/prototype validation only.
 */

import { faceapi, getDetectorOptions } from './modelLoader.js';

export const DETECTION_STATES = {
  NO_FACE: 'no_face',
  FACE_DETECTED: 'face_detected',
  MULTIPLE_FACES: 'multiple_faces',
  LOW_LIGHTING: 'low_lighting',
  FACE_TOO_FAR: 'face_too_far',
  FACE_TOO_CLOSE: 'face_too_close',
};

const FACE_AREA_MIN = 0.04;
const FACE_AREA_MAX = 0.55;

export async function detectFaces(input, options = {}) {
  const detectorOpts = getDetectorOptions(options.inputSize ?? 416);

  const detections = await faceapi
    .detectAllFaces(input, detectorOpts)
    .withFaceLandmarks()
    .withFaceExpressions();

  return detections;
}

export async function detectSingleFaceWithDescriptor(input, options = {}) {
  const detectorOpts = getDetectorOptions(options.inputSize ?? 416);

  const detection = await faceapi
    .detectSingleFace(input, detectorOpts)
    .withFaceLandmarks()
    .withFaceDescriptor()
    .withFaceExpressions();

  return detection;
}

export function classifyDetectionState(detections, lightingQuality) {
  if (lightingQuality?.isLowLight) {
    return DETECTION_STATES.LOW_LIGHTING;
  }

  if (!detections || detections.length === 0) {
    return DETECTION_STATES.NO_FACE;
  }

  if (detections.length > 1) {
    return DETECTION_STATES.MULTIPLE_FACES;
  }

  const det = detections[0].detection;
  const box = det.box;
  const imgW = det.imageWidth || 640;
  const imgH = det.imageHeight || 480;
  const normalizedArea = (box.width * box.height) / (imgW * imgH);

  if (normalizedArea < FACE_AREA_MIN) {
    return DETECTION_STATES.FACE_TOO_FAR;
  }
  if (normalizedArea > FACE_AREA_MAX) {
    return DETECTION_STATES.FACE_TOO_CLOSE;
  }

  return DETECTION_STATES.FACE_DETECTED;
}

export function getDetectionConfidence(detections) {
  if (!detections?.length) return 0;
  return detections[0].detection.score;
}

export function hasMultipleFaces(detections) {
  return detections?.length > 1;
}
