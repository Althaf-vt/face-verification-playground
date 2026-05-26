/**
 * Backend API client for local temp storage only.
 * No cloud upload — images stored in backend/temp/
 */

const API_BASE = '/api';

export async function uploadImage(file, type = 'reference') {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('type', type);

  const res = await fetch(`${API_BASE}/storage/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Upload failed');
  }
  return res.json();
}

export async function saveCapture(blob, type = 'capture') {
  const formData = new FormData();
  formData.append('image', blob, `capture-${Date.now()}.jpg`);
  formData.append('type', type);

  const res = await fetch(`${API_BASE}/storage/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Capture save failed');
  return res.json();
}

export async function appendLog(entry) {
  const res = await fetch(`${API_BASE}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
  if (!res.ok) throw new Error('Log append failed');
  return res.json();
}

export async function getLogs(limit = 50) {
  const res = await fetch(`${API_BASE}/logs?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to fetch logs');
  return res.json();
}

export async function listStoredFiles() {
  const res = await fetch(`${API_BASE}/storage/list`);
  if (!res.ok) throw new Error('Failed to list files');
  return res.json();
}

export async function clearTempStorage() {
  const res = await fetch(`${API_BASE}/storage/clear`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Clear failed');
  return res.json();
}
