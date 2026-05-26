import * as tempStorage from '../services/tempStorageService.js';

export async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image provided' });
    }
    const type = req.body.type || 'upload';
    const result = await tempStorage.saveImage(req.file.buffer, req.file.originalname, type);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listFiles(_req, res, next) {
  try {
    const files = await tempStorage.listImages();
    res.json({ files });
  } catch (err) {
    next(err);
  }
}

export async function clearStorage(_req, res, next) {
  try {
    const count = await tempStorage.clearAll();
    res.json({ cleared: count });
  } catch (err) {
    next(err);
  }
}
