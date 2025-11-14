import express from 'express';
import { getLeaderboards, updateLeaderboard } from '../services/leaderboard.service.js';
import { config } from '../config/env.js';
import { HttpError } from '../utils/errors.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const data = await getLeaderboards();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.put('/:name', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const entries = await updateLeaderboard(req.params.name, req.body?.entries || []);
    res.json(entries);
  } catch (error) {
    next(error);
  }
});

export default router;
