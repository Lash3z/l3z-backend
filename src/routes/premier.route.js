import express from 'express';
import {
  getPremierState,
  setPremierState,
  recordMatchMultiplier,
  shuffleGroups,
  setActiveMatch
} from '../services/premier.service.js';
import { config } from '../config/env.js';
import { HttpError } from '../utils/errors.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const state = await getPremierState();
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.put('/', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await setPremierState(req.body || {});
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.post('/match', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await recordMatchMultiplier(req.body || {});
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.post('/shuffle', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await shuffleGroups();
    res.json(state);
  } catch (error) {
    next(error);
  }
});

router.post('/active', async (req, res, next) => {
  try {
    const token = req.headers['x-admin-token'];
    if (token !== config.adminToken) throw new HttpError(401, 'unauthorized');
    const state = await setActiveMatch(req.body || null);
    res.json(state);
  } catch (error) {
    next(error);
  }
});

export default router;
