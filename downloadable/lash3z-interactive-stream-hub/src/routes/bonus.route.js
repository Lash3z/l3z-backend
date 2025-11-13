import express from 'express';
import { getBonusHunt, submitPrediction, setBonusHuntState, lockBonusHunt } from '../services/predictions.service.js';
import { config } from '../config/env.js';
import { HttpError } from '../utils/errors.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const state = await getBonusHunt();
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.post('/entry', async (req, res, next) => {
  try {
    const entry = await submitPrediction(req.body || {});
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await setBonusHuntState(req.body || {});
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.post('/lock', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await lockBonusHunt(req.body || {});
    res.json(state);
  } catch (error) {
    next(error);
  }
});

export default router;
