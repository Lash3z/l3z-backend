import express from 'express';
import { getLucky7State, setScoringTable, recordWinner } from '../services/lucky7.service.js';
import { config } from '../config/env.js';
import { HttpError } from '../utils/errors.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const state = await getLucky7State();
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.put('/scoring', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await setScoringTable(req.body?.scoring || []);
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.post('/winner', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await recordWinner(req.body || {});
    res.json(state);
  } catch (error) {
    next(error);
  }
});

export default router;
