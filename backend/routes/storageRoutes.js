import { Router } from 'express';
import multer from 'multer';
import * as storageController from '../controllers/storageController.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files allowed'));
    }
    cb(null, true);
  },
});

router.post('/upload', upload.single('image'), storageController.uploadImage);
router.get('/list', storageController.listFiles);
router.delete('/clear', storageController.clearStorage);

export default router;
