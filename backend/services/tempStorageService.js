import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMP_ROOT = path.join(__dirname, '..', 'temp');
const IMAGES_DIR = path.join(TEMP_ROOT, 'images');
const METADATA_FILE = path.join(TEMP_ROOT, 'metadata.json');

export async function ensureTempDirs() {
  await fs.mkdir(IMAGES_DIR, { recursive: true });
  try {
    await fs.access(METADATA_FILE);
  } catch {
    await fs.writeFile(METADATA_FILE, JSON.stringify([]));
  }
}

async function readMetadata() {
  const raw = await fs.readFile(METADATA_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeMetadata(data) {
  await fs.writeFile(METADATA_FILE, JSON.stringify(data, null, 2));
}

export async function saveImage(buffer, originalName, type = 'upload') {
  const id = uuidv4();
  const ext = path.extname(originalName) || '.jpg';
  const filename = `${type}-${id}${ext}`;
  const filepath = path.join(IMAGES_DIR, filename);

  await fs.writeFile(filepath, buffer);

  const entry = {
    id,
    filename,
    type,
    originalName,
    createdAt: new Date().toISOString(),
    size: buffer.length,
  };

  const meta = await readMetadata();
  meta.push(entry);
  await writeMetadata(meta);

  return entry;
}

export async function listImages() {
  const meta = await readMetadata();
  return meta;
}

export async function clearAll() {
  const meta = await readMetadata();
  for (const entry of meta) {
    try {
      await fs.unlink(path.join(IMAGES_DIR, entry.filename));
    } catch {
      /* file may already be gone */
    }
  }
  await writeMetadata([]);
  return meta.length;
}
