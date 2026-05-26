/**
 * Biometric QA Lab — Express backend
 * Local temp storage only. No cloud. No database.
 *
 * SECURITY: Not for production KYC. Temporary files for internal QA only.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import storageRoutes from './routes/storageRoutes.js';
import logsRoutes from './routes/logsRoutes.js';
import { ensureTempDirs } from './services/tempStorageService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json({ limit: '1mb' }));

await ensureTempDirs();

app.use('/api/storage', storageRoutes);
app.use('/api/logs', logsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'biometric-qa-backend' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Biometric QA backend running on http://localhost:${PORT}`);
});
