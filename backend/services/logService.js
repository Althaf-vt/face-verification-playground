import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_FILE = path.join(__dirname, '..', 'temp', 'logs.json');
const MAX_LOGS = 500;

async function ensureLogsFile() {
  try {
    await fs.access(LOGS_FILE);
  } catch {
    await fs.mkdir(path.dirname(LOGS_FILE), { recursive: true });
    await fs.writeFile(LOGS_FILE, JSON.stringify([]));
  }
}

export async function append(entry) {
  await ensureLogsFile();
  const raw = await fs.readFile(LOGS_FILE, 'utf-8');
  const logs = JSON.parse(raw);
  const record = {
    ...entry,
    timestamp: entry.timestamp || new Date().toISOString(),
    id: Date.now().toString(36),
  };
  logs.unshift(record);
  if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
  await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2));
  return record;
}

export async function getRecent(limit = 50) {
  await ensureLogsFile();
  const raw = await fs.readFile(LOGS_FILE, 'utf-8');
  const logs = JSON.parse(raw);
  return logs.slice(0, limit);
}
