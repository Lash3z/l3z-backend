import express from 'express';
import { getStaminaState, enqueuePlayer, recordWin, nextChallenger } from '../services/stamina.service.js';
import { config } from '../config/env.js';
import { HttpError } from '../utils/errors.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const state = await getStaminaState();
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.post('/queue', async (req, res, next) => {
  try {
    const entry = await enqueuePlayer(req.body || {});
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

router.post('/win', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await recordWin(req.body?.userId);
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.post('/next', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await nextChallenger();
    res.json(state);
  } catch (error) {
    next(error);
  }
});

export default router;
