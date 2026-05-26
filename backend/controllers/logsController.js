import * as logService from '../services/logService.js';

export async function appendLog(req, res, next) {
  try {
    const entry = await logService.append(req.body);
    res.status(201).json(entry);
  } catch (err) {
    next(err);
  }
}

export async function getLogs(req, res, next) {
  try {
    const limit = parseInt(req.query.limit, 10) || 50;
    const logs = await logService.getRecent(limit);
    res.json({ logs });
  } catch (err) {
    next(err);
  }
}
