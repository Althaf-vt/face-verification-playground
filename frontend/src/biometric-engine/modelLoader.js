/**
 * face-api.js model loader
 *
 * SECURITY NOTE: This loads client-side models for QA/testing only.
 * Not suitable for banking-grade KYC. False positives/negatives are possible.
 */

import * as faceapi from 'face-api.js';

const MODEL_BASE = '/models';

let loadPromise = null;
let modelsLoaded = false;

const MODEL_MANIFEST = [
  { name: 'TinyFaceDetector', path: `${MODEL_BASE}/tiny_face_detector` },
  { name: 'FaceLandmark68Net', path: `${MODEL_BASE}/face_landmark_68` },
  { name: 'FaceRecognitionNet', path: `${MODEL_BASE}/face_recognition` },
  { name: 'FaceExpressionNet', path: `${MODEL_BASE}/face_expression` },
];

export async function loadModels(onProgress) {
  if (modelsLoaded) return true;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      onProgress?.({ stage: 'tinyFaceDetector', progress: 0 });
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_MANIFEST[0].path);
      onProgress?.({ stage: 'faceLandmark68Net', progress: 25 });
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_MANIFEST[1].path);
      onProgress?.({ stage: 'faceRecognitionNet', progress: 50 });
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_MANIFEST[2].path);
      onProgress?.({ stage: 'faceExpressionNet', progress: 75 });
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_MANIFEST[3].path);
      onProgress?.({ stage: 'complete', progress: 100 });
      modelsLoaded = true;
      return true;
    } catch (err) {
      loadPromise = null;
      throw new Error(
        `Failed to load face-api models. Ensure models are in public/models/. ${err.message}`
      );
    }
  })();

  return loadPromise;
}

export function areModelsLoaded() {
  return modelsLoaded;
}

export function getDetectorOptions(inputSize = 416) {
  return new faceapi.TinyFaceDetectorOptions({
    inputSize,
    scoreThreshold: 0.5,
  });
}

export { faceapi };
