import { Router } from 'express';
import * as logsController from '../controllers/logsController.js';

const router = Router();

router.post('/', logsController.appendLog);
router.get('/', logsController.getLogs);

export default router;
