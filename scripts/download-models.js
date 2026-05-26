#!/usr/bin/env node
/**
 * Downloads face-api.js model weights into frontend/public/models/
 * Run: node scripts/download-models.js
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_DIR = path.join(__dirname, '..', 'frontend', 'public', 'models');
const BASE =
  'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const MODELS = {
  tiny_face_detector: [
    'tiny_face_detector_model-weights_manifest.json',
    'tiny_face_detector_model-shard1',
  ],
  face_landmark_68: [
    'face_landmark_68_model-weights_manifest.json',
    'face_landmark_68_model-shard1',
  ],
  face_recognition: [
    'face_recognition_model-weights_manifest.json',
    'face_recognition_model-shard1',
    'face_recognition_model-shard2',
  ],
  face_expression: [
    'face_expression_model-weights_manifest.json',
    'face_expression_model-shard1',
  ],
};

function download(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          return download(res.headers.location).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      })
      .on('error', reject);
  });
}

async function main() {
  console.log('Downloading face-api.js models to', MODELS_DIR);

  for (const [folder, files] of Object.entries(MODELS)) {
    const dir = path.join(MODELS_DIR, folder);
    await fs.mkdir(dir, { recursive: true });
    for (const file of files) {
      const url = `${BASE}/${file}`;
      const dest = path.join(dir, file);
      process.stdout.write(`  ${folder}/${file}... `);
      const data = await download(url);
      await fs.writeFile(dest, data);
      console.log('OK');
    }
  }

  console.log('\nAll models downloaded successfully.');
}

main().catch((err) => {
  console.error('Download failed:', err.message);
  process.exit(1);
});
