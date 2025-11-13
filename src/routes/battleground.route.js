import express from 'express';
import {
  getBattlegroundState,
  setBattlegroundState,
  updateMatchScore,
  recordScore,
  advanceRotation
} from '../services/battleground.service.js';
import { config } from '../config/env.js';
import { HttpError } from '../utils/errors.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const state = await getBattlegroundState();
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await setBattlegroundState(req.body || {});
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.post('/match/:id', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await updateMatchScore(req.params.id, req.body || {});
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.post('/result', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await recordScore(req.body || {});
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.post('/rotate', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await advanceRotation();
    res.json(state);
  } catch (error) {
    next(error);
  }
});

export default router;
